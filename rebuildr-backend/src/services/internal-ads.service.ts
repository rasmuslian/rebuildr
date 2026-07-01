import {
  GoogleGenAI,
  Part,
  PartMediaResolutionLevel,
  ThinkingLevel,
} from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { QuantityUnitEnum } from 'src/constants/enums';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import {
  InternalAdImportBatch,
  InternalAdImportBatchStatus,
} from 'src/entities/internal-ad-import-batch.entity';
import { InternalAdReservation } from 'src/entities/internal-ad-reservation.entity';
import {
  OrganizationInvite,
  OrganizationInviteStatus,
} from 'src/entities/organization-invite.entity';
import {
  OrganizationMemberRole,
  OrganizationMembership,
} from 'src/entities/organization-membership.entity';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { User, UserType } from 'src/entities/user.entity';
import {
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from 'src/exceptions';
import { FileInputType } from 'src/resolvers/file.resolver';
import { ProductsInput } from 'src/resolvers/product.resolver';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  DataSource,
  In,
  IsNull,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Logger } from 'winston';
import { BrandService } from './brand.service';
import { FileService } from './file.service';
import { MailService } from './mail.service';

const GEMINI_TIMEOUT_MS = 120_000;
const IMPORT_FILE_FETCH_TIMEOUT_MS = 20_000;

export type OrganizationContext = {
  organization: User;
  role: OrganizationMemberRole;
  isOrganizationAccount: boolean;
};

type ImportDraft = {
  title?: string | null;
  description?: string | null;
  additionalInfo?: string | null;
  brand?: string | null;
  categoryId?: string | null;
  condition?: ProductConditionEnum | null;
  primaryQuantification?: string | null;
  secondaryQuantification?: string | null;
  dimensions?: Record<string, string> | null;
  weight?: number | null;
  color?: string | null;
  sourceImageFileNames?: string[] | null;
  warnings?: string[] | null;
};

@Injectable()
export class InternalAdsService {
  private gemini = new GoogleGenAI({});

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(OrganizationMembership)
    private membershipRepository: Repository<OrganizationMembership>,
    @InjectRepository(OrganizationInvite)
    private inviteRepository: Repository<OrganizationInvite>,
    @InjectRepository(InternalAdReservation)
    private reservationRepository: Repository<InternalAdReservation>,
    @InjectRepository(InternalAdImportBatch)
    private importBatchRepository: Repository<InternalAdImportBatch>,
    private fileService: FileService,
    private brandService: BrandService,
    private mailService: MailService,
    private dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getOrganizationContext(userId: string): Promise<OrganizationContext> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw BadUserInputException('Invalid user');
    }

    if (user.type === UserType.BUSINESS && user.internalAdsAccess) {
      return {
        organization: user,
        role: OrganizationMemberRole.ADMIN,
        isOrganizationAccount: true,
      };
    }

    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        organization: { internalAdsAccess: true },
      },
      relations: { organization: true },
      order: { createdAt: 'ASC' },
    });
    if (!membership) {
      throw ForbiddenException('No access to internal ads');
    }

    return {
      organization: membership.organization,
      role: membership.role,
      isOrganizationAccount: false,
    };
  }

  async getOptionalOrganizationContext(userId?: string) {
    if (!userId) return null;
    try {
      return await this.getOrganizationContext(userId);
    } catch {
      return null;
    }
  }

  async assertProductAccess(product: Product, userId: string) {
    if (product.visibility !== ProductVisibility.INTERNAL) return;
    const context = await this.getOrganizationContext(userId);
    if (context.organization.id !== product.internalOrganizationId) {
      throw ForbiddenException(
        'Internal product belongs to another organization',
      );
    }
  }

  async members(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    await this.assertOrganizationAdmin(context);
    return this.membershipRepository.find({
      where: { organizationId: context.organization.id },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async invites(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    await this.assertOrganizationAdmin(context);
    return this.inviteRepository.find({
      where: {
        organizationId: context.organization.id,
        status: OrganizationInviteStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async inviteMember(
    currentUserId: string,
    input: { email: string; role: OrganizationMemberRole },
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    await this.assertOrganizationAdmin(context);

    const email = input.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      const alreadyMember = await this.membershipRepository.existsBy({
        organizationId: context.organization.id,
        userId: existingUser.id,
      });
      if (alreadyMember) {
        throw BadUserInputException('User is already a member');
      }
    }

    const invite = this.inviteRepository.create({
      email,
      organizationId: context.organization.id,
      invitedByUserId: currentUserId,
      role: input.role,
      token: crypto.randomBytes(32).toString('hex'),
      status: OrganizationInviteStatus.PENDING,
    });
    const savedInvite = await this.inviteRepository.save(invite);
    await this.mailService.sendOrganizationInviteEmail({
      email,
      organizationName:
        context.organization.name ??
        context.organization.username ??
        'RebuildR',
      token: savedInvite.token,
    });
    return savedInvite;
  }

  async acceptInvite(input: {
    token: string;
    username?: string;
    password?: string;
  }) {
    const invite = await this.inviteRepository.findOne({
      where: { token: input.token, status: OrganizationInviteStatus.PENDING },
      relations: { organization: true },
    });
    if (!invite) {
      throw NotFoundException('Invite not found');
    }

    let user = await this.userRepository.findOneBy({ email: invite.email });
    if (!user) {
      if (!input.username || !input.password) {
        throw BadFieldsInputException([
          { name: 'username', message: 'Användarnamn krävs' },
          { name: 'password', message: 'Lösenord krävs' },
        ]);
      }
      const usernameTaken = await this.userRepository.existsBy({
        username: input.username,
      });
      if (usernameTaken) {
        throw BadFieldsInputException([
          {
            name: 'username',
            message: 'Username taken',
            type: 'VALUE_TAKEN',
          },
        ]);
      }
      user = this.userRepository.create({
        email: invite.email,
        username: input.username,
        password: await bcrypt.hash(input.password, 10),
        emailVerifiedAt: new Date(),
        type: UserType.BUSINESS,
      });
    } else {
      user.type = UserType.BUSINESS;
      user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
      if (input.username && !user.username) {
        user.username = input.username;
      }
      if (input.password && !user.password) {
        user.password = await bcrypt.hash(input.password, 10);
      }
    }

    const savedUser = await this.userRepository.save(user);
    await this.membershipRepository.upsert(
      {
        organizationId: invite.organizationId,
        userId: savedUser.id,
        role: invite.role,
      },
      ['organizationId', 'userId'],
    );
    invite.status = OrganizationInviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    invite.acceptedByUserId = savedUser.id;
    await this.inviteRepository.save(invite);
    return savedUser;
  }

  async updateMemberRole(
    currentUserId: string,
    input: { userId: string; role: OrganizationMemberRole },
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    await this.assertOrganizationAdmin(context);
    const membership = await this.membershipRepository.findOne({
      where: { organizationId: context.organization.id, userId: input.userId },
      relations: { user: true },
    });
    if (!membership) {
      throw NotFoundException('Member not found');
    }
    membership.role = input.role;
    return this.membershipRepository.save(membership);
  }

  async createInternalDraft(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const product = new Product();
    product.title = '';
    product.price = 0;
    product.isGiveaway = true;
    product.status = ProductStatus.DRAFT;
    product.visibility = ProductVisibility.INTERNAL;
    product.internalOrganizationId = context.organization.id;
    product.seller = context.organization;
    product.sellerId = context.organization.id;
    product.createdByUserId = currentUserId;
    product.address = context.organization.address;
    product.addressLocation = context.organization.addressLocation;
    product.pickupEnabled = true;
    product.internalValidationIssues = this.validateInternalProduct(product, 0);
    return this.productRepository.save(product);
  }

  async internalAds(
    currentUserId: string,
    input: ProductsInput,
    limit = 20,
    offset = 0,
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    const query = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.seller', 'seller')
      .where('p.visibility = :visibility', {
        visibility: ProductVisibility.INTERNAL,
      })
      .andWhere('p."internalOrganizationId" = :organizationId', {
        organizationId: context.organization.id,
      })
      .andWhere('p.status IN (:...statuses)', {
        statuses: [ProductStatus.PUBLISHED, ProductStatus.SOLD],
      })
      .andWhere('p."hiddenReason" IS NULL');

    this.applyInternalProductFilters(query, input);
    query.take(Math.min(limit, 40)).skip(offset * limit);
    query.addOrderBy('p.status', 'ASC').addOrderBy('p.publishedAt', 'DESC');

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  async internalAd(currentUserId: string, productId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        visibility: ProductVisibility.INTERNAL,
        internalOrganizationId: context.organization.id,
      },
      relations: {
        seller: true,
        createdByUser: true,
        internalReservations: { reservedByUser: true },
      },
    });
    if (!product) {
      throw NotFoundException('Internal ad not found');
    }
    return product;
  }

  async myInternalDrafts(currentUserId: string, batchId?: string) {
    const context = await this.getOrganizationContext(currentUserId);
    return this.productRepository.find({
      where: {
        visibility: ProductVisibility.INTERNAL,
        internalOrganizationId: context.organization.id,
        status: ProductStatus.DRAFT,
        internalAdImportBatchId: batchId,
      },
      relations: { images: true, category: true, brand: true },
      order: { createdAt: 'ASC' },
    });
  }

  async removeInternalDraft(currentUserId: string, productId: string) {
    const product = await this.internalAd(currentUserId, productId);
    if (product.status !== ProductStatus.DRAFT) {
      throw BadUserInputException('Product is not a draft');
    }
    await this.productRepository.remove(product);
    return true;
  }

  async publishInternalDrafts(currentUserId: string, productIds: string[]) {
    const context = await this.getOrganizationContext(currentUserId);
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
        visibility: ProductVisibility.INTERNAL,
        internalOrganizationId: context.organization.id,
      },
      relations: { images: true, category: true },
    });

    if (products.length !== productIds.length) {
      throw BadUserInputException('Invalid products');
    }

    const invalidProducts = products
      .map((product) => ({
        product,
        issues: this.validateInternalProduct(
          product,
          product.images?.length ?? 0,
        ),
      }))
      .filter(({ issues }) => issues.length > 0);
    if (invalidProducts.length) {
      invalidProducts.forEach(({ product, issues }) => {
        product.internalValidationIssues = issues;
      });
      await this.productRepository.save(
        invalidProducts.map((item) => item.product),
      );
      throw BadUserInputException('All internal ads must be valid');
    }

    products.forEach((product) => {
      product.status = ProductStatus.PUBLISHED;
      product.price = 0;
      product.isGiveaway = true;
      product.internalValidationIssues = [];
    });
    const savedProducts = await this.productRepository.save(products);
    const batchIds = [
      ...new Set(
        savedProducts
          .map((product) => product.internalAdImportBatchId)
          .filter(Boolean),
      ),
    ];
    if (batchIds.length) {
      await this.importBatchRepository.update(batchIds, {
        status: InternalAdImportBatchStatus.PUBLISHED,
        progress: 100,
      });
    }
    return savedProducts;
  }

  async reserveInternalAd(
    currentUserId: string,
    input: { productId: string; quantity?: number },
  ) {
    const product = await this.internalAd(currentUserId, input.productId);
    if (product.status !== ProductStatus.PUBLISHED) {
      throw BadUserInputException('Product is not available');
    }
    if (product.soldByQuantity && (!input.quantity || input.quantity <= 0)) {
      throw BadUserInputException('Quantity is required');
    }
    const activeReservations = await this.activeReservations(product.id);
    if (!product.soldByQuantity && activeReservations.length) {
      throw BadUserInputException('Product is already reserved');
    }
    if (product.soldByQuantity) {
      const reservedQuantity = activeReservations.reduce(
        (sum, reservation) => sum + (reservation.quantity ?? 0),
        0,
      );
      if (reservedQuantity + input.quantity > product.primaryQuantity) {
        throw BadUserInputException('Not enough quantity available');
      }
    }
    const reservation = this.reservationRepository.create({
      productId: product.id,
      reservedByUserId: currentUserId,
      quantity: product.soldByQuantity ? input.quantity : null,
    });
    const saved = await this.reservationRepository.save(reservation);
    await this.notifyInternalAdEvent(product, currentUserId, 'reserverats');
    return saved;
  }

  async cancelReservation(currentUserId: string, reservationId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: { product: true },
    });
    if (!reservation || reservation.canceledAt) {
      throw NotFoundException('Reservation not found');
    }
    const context = await this.getOrganizationContext(currentUserId);
    if (
      reservation.product.internalOrganizationId !== context.organization.id
    ) {
      throw ForbiddenException();
    }
    const canCancel =
      reservation.reservedByUserId === currentUserId ||
      reservation.product.createdByUserId === currentUserId ||
      context.role === OrganizationMemberRole.ADMIN;
    if (!canCancel) {
      throw ForbiddenException();
    }
    reservation.canceledAt = new Date();
    return this.reservationRepository.save(reservation);
  }

  async markInternalAdSold(
    currentUserId: string,
    input: { productId: string; reservationId?: string },
  ) {
    const product = await this.internalAd(currentUserId, input.productId);
    const context = await this.getOrganizationContext(currentUserId);
    const canMarkSold =
      product.createdByUserId === currentUserId ||
      context.role === OrganizationMemberRole.ADMIN;
    if (!canMarkSold) {
      throw ForbiddenException();
    }

    if (input.reservationId && product.soldByQuantity) {
      const reservation = await this.reservationRepository.findOneBy({
        id: input.reservationId,
        productId: product.id,
      });
      if (!reservation || reservation.canceledAt || reservation.soldAt) {
        throw BadUserInputException('Invalid reservation');
      }
      product.primaryQuantity = Math.max(
        0,
        (product.primaryQuantity ?? 0) - (reservation.quantity ?? 0),
      );
      reservation.soldAt = new Date();
      await this.reservationRepository.save(reservation);
      if (product.primaryQuantity <= 0) {
        product.status = ProductStatus.SOLD;
      }
    } else {
      product.status = ProductStatus.SOLD;
      const reservations = await this.activeReservations(product.id);
      reservations.forEach((reservation) => {
        reservation.soldAt = new Date();
      });
      if (reservations.length) {
        await this.reservationRepository.save(reservations);
      }
    }
    const saved = await this.productRepository.save(product);
    await this.notifyInternalAdEvent(
      product,
      currentUserId,
      'markerats som såld',
    );
    return saved;
  }

  async createImportBatch(currentUserId: string, files: FileInputType[]) {
    const context = await this.getOrganizationContext(currentUserId);
    const dbFiles = await this.fileService.createFiles(files, true);
    const batch = this.importBatchRepository.create({
      organizationId: context.organization.id,
      createdByUserId: currentUserId,
      status: InternalAdImportBatchStatus.UPLOADING,
      progress: 0,
      files: dbFiles,
    });
    const savedBatch = await this.importBatchRepository.save(batch);
    return {
      batch: savedBatch,
      uploadUrls: await this.fileService.uploadFiles(dbFiles),
    };
  }

  async startImportBatch(currentUserId: string, batchId: string) {
    const batch = await this.findBatchForUser(currentUserId, batchId);
    batch.status = InternalAdImportBatchStatus.QUEUED;
    batch.progress = 5;
    const savedBatch = await this.importBatchRepository.save(batch);
    this.processImportBatch(savedBatch.id).catch((error) => {
      this.logger.error('Internal ad import batch failed', {
        error: error instanceof Error ? error.message : error,
        batchId: savedBatch.id,
      });
    });
    return savedBatch;
  }

  async importBatch(currentUserId: string, batchId: string) {
    return this.findBatchForUser(currentUserId, batchId);
  }

  async cmsInternalAds(input: {
    page?: number;
    pageSize?: number;
    searchString?: string;
  }) {
    const { page = 0, pageSize = 10, searchString = '' } = input;
    const query = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.seller', 'seller')
      .leftJoinAndSelect('p.createdByUser', 'createdByUser')
      .where('p.visibility = :visibility', {
        visibility: ProductVisibility.INTERNAL,
      });
    if (searchString) {
      query.andWhere(
        '(p.title ILIKE :search OR seller.username ILIKE :search OR seller.email ILIKE :search)',
        { search: `%${searchString}%` },
      );
    }
    query
      .take(pageSize)
      .skip(page * pageSize)
      .orderBy('p.createdAt', 'DESC');
    const result = await query.getManyAndCount();
    return { products: result[0], total: result[1] };
  }

  private async processImportBatch(batchId: string) {
    const batch = await this.importBatchRepository.findOne({
      where: { id: batchId },
      relations: { files: true, organization: true },
    });
    if (!batch) return;
    try {
      batch.status = InternalAdImportBatchStatus.PROCESSING;
      batch.progress = 15;
      await this.importBatchRepository.save(batch);

      const { categoryList, leafCategories } = await this.getLeafCategories();
      const fileParts = await this.importFilesToGeminiParts(batch.files);
      batch.progress = 45;
      await this.importBatchRepository.save(batch);

      const response = await this.gemini.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          httpOptions: { timeout: GEMINI_TIMEOUT_MS },
        },
        contents: [
          {
            parts: [
              ...fileParts,
              {
                text: this.bulkImportPrompt(categoryList),
              },
            ],
          },
        ],
      });
      batch.progress = 70;
      await this.importBatchRepository.save(batch);

      const drafts = this.parseImportResponse(response.text ?? '');
      await this.createProductsFromDrafts(batch, drafts, leafCategories);
      batch.status = InternalAdImportBatchStatus.READY;
      batch.progress = 100;
      await this.importBatchRepository.save(batch);
    } catch (error) {
      batch.status = InternalAdImportBatchStatus.FAILED;
      batch.errorMessage =
        error instanceof Error ? error.message : 'Import failed';
      batch.progress = 100;
      await this.importBatchRepository.save(batch);
      throw error;
    }
  }

  private async createProductsFromDrafts(
    batch: InternalAdImportBatch,
    drafts: ImportDraft[],
    leafCategories: Category[],
  ) {
    const imageFilesByName = new Map(
      batch.files
        .filter((file) => file.mimeType.startsWith('image/'))
        .map((file) => [file.name?.toLowerCase(), file]),
    );
    const usedImageIds = new Set<string>();

    for (const draft of drafts) {
      const product = this.productRepository.create({
        title: draft.title?.trim() ?? '',
        description: draft.description?.trim() ?? null,
        additionalInfo: draft.additionalInfo?.trim() ?? null,
        price: 0,
        isGiveaway: true,
        status: ProductStatus.DRAFT,
        visibility: ProductVisibility.INTERNAL,
        internalOrganizationId: batch.organizationId,
        sellerId: batch.organizationId,
        createdByUserId: batch.createdByUserId,
        internalAdImportBatchId: batch.id,
        condition: this.validCondition(draft.condition),
        color: draft.color?.trim() ?? null,
        colorType: draft.color ? ColorTypeEnum.FREE_TEXT : ColorTypeEnum.NCS,
        pickupEnabled: true,
        soldByQuantity: false,
      });

      if (draft.categoryId) {
        const category = leafCategories.find(
          (item) => item.id === draft.categoryId,
        );
        if (category) product.categoryId = category.id;
      }
      this.applyQuantification(product, draft.primaryQuantification, 'primary');
      this.applyQuantification(
        product,
        draft.secondaryQuantification,
        'secondary',
      );
      this.applyDimensions(product, draft.dimensions);
      if (draft.weight) {
        product.weight = Math.round(Number(draft.weight));
        product.weightUnit = MeasurementUnitEnum.KG;
      }
      if (draft.brand && draft.brand.toLowerCase() !== 'okänt') {
        const existingBrand = await this.brandService.findBrandByName(
          draft.brand,
        );
        product.brand =
          existingBrand ??
          (await this.brandService.createBrand({
            name: draft.brand,
            categoryId: product.categoryId,
          }));
      }
      const savedProduct = await this.productRepository.save(product);
      const matchedImages = (draft.sourceImageFileNames ?? [])
        .map((name) => imageFilesByName.get(name?.toLowerCase()))
        .filter((file): file is File => !!file && !usedImageIds.has(file.id));
      matchedImages.forEach((file) => {
        file.productImage = savedProduct;
        usedImageIds.add(file.id);
      });
      if (matchedImages.length) {
        await this.fileRepository.save(matchedImages);
      }
      const issues = this.validateInternalProduct(
        savedProduct,
        matchedImages.length,
      );
      savedProduct.internalValidationIssues = [
        ...issues,
        ...(draft.warnings ?? []).filter(Boolean),
      ];
      await this.productRepository.save(savedProduct);
    }
  }

  private validateInternalProduct(product: Product, imageCount: number) {
    const issues: string[] = [];
    if (!imageCount) issues.push('Minst en bild saknas');
    if (!product.title?.trim()) issues.push('Titel saknas');
    if (!product.description?.trim()) issues.push('Beskrivning saknas');
    if (!product.categoryId) issues.push('Kategori saknas');
    if (!product.primaryQuantity || !product.primaryUnit)
      issues.push('Mängd saknas');
    if (!product.condition) issues.push('Skick saknas');
    if (!product.brandId && !product.brand) issues.push('Varumärke saknas');
    return issues;
  }

  private async importFilesToGeminiParts(files: File[]): Promise<Part[]> {
    const parts: Part[] = [];
    for (const file of files) {
      const url = await this.fileService.getUrl(file);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(IMPORT_FILE_FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Could not fetch uploaded file ${file.id}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      parts.push({
        text: `FILE_NAME: ${file.name ?? file.id}\nMIME_TYPE: ${file.mimeType}`,
      });
      parts.push({
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: file.mimeType,
        },
        mediaResolution: file.mimeType.startsWith('image/')
          ? { level: PartMediaResolutionLevel.MEDIA_RESOLUTION_MEDIUM }
          : undefined,
      });
    }
    return parts;
  }

  private bulkImportPrompt(categoryList: string) {
    return `
You create internal inventory draft listings for RebuildR, a Swedish marketplace for reclaimed building materials.
The uploaded files may be PDFs, Markdown, XLSX, CSV and images. Use all context, including file names.
One image may contain several products, and one product may have several images. Match images to rows/text as well as you can. Avoid duplicate listings when an image and a spreadsheet row describe the same product.

Return ONLY valid JSON with this shape:
{
  "products": [
    {
      "title": "Swedish title, max 8 words",
      "description": "Swedish factual description, max 60 words",
      "additionalInfo": "Swedish caveats or visible defects, max 30 words, or null",
      "brand": "Brand/manufacturer if known, otherwise Okänt",
      "condition": "${Object.values(ProductConditionEnum).join('|')}",
      "primaryQuantification": "QUANTITY,${Object.keys(QuantityUnitEnum).join('|')}",
      "secondaryQuantification": "QUANTITY,UNIT or null",
      "dimensions": { "height": "100,MM", "width": "50,MM", "length": "10,MM", "thickness": "5,MM", "diameter": "20,MM" },
      "weight": 10,
      "color": "color if relevant or null",
      "categoryId": "one UUID from the category list below or null",
      "sourceImageFileNames": ["exact-image-file-name.jpg"],
      "warnings": ["short Swedish warning for missing/uncertain information"]
    }
  ]
}

If mandatory listing information is missing, still create the product draft and add a warning. Do not invent exact measurements, brands or quantities when the source is unclear; use null and warnings.

CATEGORY LIST (id | parent > name):
${categoryList}
`;
  }

  private parseImportResponse(text: string): ImportDraft[] {
    const cleaned = text
      .replace(/^```json/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned) as
      | { products?: ImportDraft[] }
      | ImportDraft[];
    const products = Array.isArray(parsed) ? parsed : parsed.products;
    if (!products?.length) {
      throw new Error('AI returned no products');
    }
    return products;
  }

  private async getLeafCategories() {
    const leafCategories = await this.categoryRepository.find({
      where: { parentId: Not(IsNull()) },
      relations: { parent: true },
    });
    const categoryList = leafCategories
      .map(
        (category) =>
          `${category.id} | ${category.parent?.name ?? ''} > ${category.name}`,
      )
      .join('\n');
    return { leafCategories, categoryList };
  }

  private applyInternalProductFilters(
    query: SelectQueryBuilder<Product>,
    input: ProductsInput,
  ) {
    if (input.searchString) {
      query.andWhere(
        '(p.title ILIKE :search OR p.description ILIKE :search OR p."searchDocument" ILIKE :search)',
        { search: `%${input.searchString}%` },
      );
    }
    if (input.categoryIds?.length) {
      query.leftJoin('category', 'c', 'p."categoryId" = c.id');
      query.andWhere(
        '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
        {
          categoryIds: input.categoryIds,
        },
      );
    }
    if (input.conditions?.length) {
      query.andWhere('p.condition IN (:...conditions)', {
        conditions: input.conditions,
      });
    }
    if (input.brandIds?.length) {
      query.andWhere('p."brandId" IN (:...brandIds)', {
        brandIds: input.brandIds,
      });
    }
  }

  private applyQuantification(
    product: Product,
    quantification: string | null | undefined,
    kind: 'primary' | 'secondary',
  ) {
    if (!quantification?.includes(',')) return;
    const [quantityValue, unitValue] = quantification.split(',');
    const unit = unitValue?.trim();
    if (!(unit in QuantityUnitEnum)) return;
    const quantity = Math.round(Number(quantityValue));
    if (!Number.isFinite(quantity)) return;
    if (kind === 'primary') {
      product.primaryQuantity = quantity;
      product.primaryUnit = unit as QuantityUnitEnum;
    } else {
      product.secondaryQuantity = quantity;
      product.secondaryUnit = unit as QuantityUnitEnum;
    }
  }

  private applyDimensions(
    product: Product,
    dimensions?: Record<string, string> | null,
  ) {
    if (!dimensions) return;
    const validKeys = ['height', 'width', 'length', 'thickness', 'diameter'];
    for (const key of validKeys) {
      const value = dimensions[key];
      if (!value?.includes(',')) continue;
      const [amount, unit] = value.split(',');
      product[key] = parseInt(amount, 10);
      product[`${key}Unit`] = unit.trim() as MeasurementUnitEnum;
    }
  }

  private validCondition(condition?: ProductConditionEnum | null) {
    return Object.values(ProductConditionEnum).includes(condition)
      ? condition
      : ProductConditionEnum.GOOD;
  }

  private async activeReservations(productId: string) {
    return this.reservationRepository.find({
      where: { productId, canceledAt: IsNull(), soldAt: IsNull() },
      relations: { reservedByUser: true },
      order: { reservedAt: 'ASC' },
    });
  }

  private async findBatchForUser(currentUserId: string, batchId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const batch = await this.importBatchRepository.findOne({
      where: { id: batchId, organizationId: context.organization.id },
      relations: { files: true, products: true },
    });
    if (!batch) {
      throw NotFoundException('Import batch not found');
    }
    return batch;
  }

  private async assertOrganizationAdmin(context: OrganizationContext) {
    if (context.role !== OrganizationMemberRole.ADMIN) {
      throw ForbiddenException('Organization admin required');
    }
  }

  private async notifyInternalAdEvent(
    product: Product,
    actorId: string,
    action: string,
  ) {
    const [actor, creator, organization] = await Promise.all([
      this.userRepository.findOneBy({ id: actorId }),
      product.createdByUserId
        ? this.userRepository.findOneBy({ id: product.createdByUserId })
        : null,
      this.userRepository.findOneBy({ id: product.internalOrganizationId }),
    ]);
    const receiverEmail = creator?.email ?? organization?.email;
    if (!receiverEmail || actor?.id === creator?.id) return;
    await this.mailService.sendInternalAdEventEmail({
      email: receiverEmail,
      productTitle: product.title,
      actorName: actor?.name ?? actor?.username ?? actor?.email ?? 'En kollega',
      action,
    });
  }
}
