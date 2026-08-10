import {
  GoogleGenAI,
  Part,
  PartMediaResolutionLevel,
  ThinkingLevel,
} from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import * as crypto from 'crypto';
import { QuantityUnitEnum } from 'src/constants/enums';
import { maximumProductPrice } from 'src/constants/pricing';
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
import { MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { User, UserType } from 'src/entities/user.entity';
import {
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from 'src/exceptions';
import { FileInputType } from 'src/resolvers/file.resolver';
import { MapPinGroupsInput } from 'src/resolvers/map-pin.resolver';
import {
  OrderProductsEnum,
  ProductsInput,
} from 'src/resolvers/product.resolver';
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
  internalReferenceNumber?: string | null;
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
    const hasOrigin = this.applyInternalProductLocation(query, input);
    query.take(Math.min(limit, 40)).skip(offset * limit);
    query.addOrderBy('p.status', 'ASC');
    this.applyInternalProductOrdering(query, input, hasOrigin);

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  async relatedInternalAds(
    currentUserId: string,
    input: ProductsInput,
    excludeProductIds: string[],
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

    this.applyInternalProductFilters(query, {
      ...input,
      searchString: undefined,
      distance: undefined,
      location: undefined,
      pickup: undefined,
      shipping: undefined,
      delivery: undefined,
    });
    if (excludeProductIds.length) {
      query.andWhere('p.id NOT IN (:...excludeProductIds)', {
        excludeProductIds,
      });
    }
    query.take(Math.min(limit, 40)).skip(offset * limit);
    query.addOrderBy('p.status', 'ASC');
    this.applyInternalProductOrdering(query, input, false);

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  async internalAdMapPinGroups(
    currentUserId: string,
    input: MapPinGroupsInput,
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    const cellSize = this.internalMapCellSize(input.zoom);
    const query = this.productRepository
      .createQueryBuilder('p')
      .innerJoin('p.mapPin', 'mapPin')
      .select('ST_X(ST_Centroid(ST_Collect(mapPin.location)))', 'latitude')
      .addSelect('ST_Y(ST_Centroid(ST_Collect(mapPin.location)))', 'longitude')
      .addSelect('ARRAY_AGG(p.id)', 'productIds')
      .addSelect('ARRAY_AGG(p.price ORDER BY p.price)', 'prices')
      .where('p.visibility = :visibility', {
        visibility: ProductVisibility.INTERNAL,
      })
      .andWhere('p."internalOrganizationId" = :organizationId', {
        organizationId: context.organization.id,
      })
      .andWhere('p.status IN (:...statuses)', {
        statuses: [ProductStatus.PUBLISHED, ProductStatus.SOLD],
      })
      .andWhere('p."hiddenReason" IS NULL')
      .andWhere(
        'mapPin.location && ST_MakeEnvelope(:swLat, :swLng, :neLat, :neLng, 4326)',
        {
          swLat: input.southWest.lat,
          swLng: input.southWest.lng,
          neLat: input.northEast.lat,
          neLng: input.northEast.lng,
        },
      )
      .groupBy('ST_SnapToGrid(mapPin.location, :cellSize)')
      .setParameter('cellSize', cellSize);

    if (input.productsInput) {
      this.applyInternalProductFilters(query, input.productsInput);
      if (
        input.productsInput.location &&
        input.productsInput.distance !== undefined
      ) {
        query.andWhere(
          'st_distancesphere(p."addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:mapOrigin), ST_SRID(p."addressLocation"))) <= :mapDistance',
          {
            mapOrigin: {
              type: 'Point',
              coordinates: [
                input.productsInput.location.lat,
                input.productsInput.location.lng,
              ],
            },
            mapDistance: input.productsInput.distance,
          },
        );
      }
    }

    const groups: {
      latitude: number;
      longitude: number;
      productIds: string[];
      prices: number[];
    }[] = await query.getRawMany();

    return {
      mapPinGroups: groups.map((group) => ({
        location: { lat: group.latitude, lng: group.longitude },
        productIds: group.productIds,
        projectId: null,
        type: MapPinTypeEnum.PRODUCT,
        prices: group.prices.map((price) => price / 100),
      })),
      total: groups.length,
    };
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
    const files = [...(product.images ?? []), ...(product.documents ?? [])];
    await this.fileService.deleteFiles(files);
    await this.productRepository.remove(product);
    return true;
  }

  async removeImportBatch(currentUserId: string, batchId: string) {
    const batch = await this.findBatchForUser(currentUserId, batchId);
    batch.status = InternalAdImportBatchStatus.FAILED;
    await this.importBatchRepository.save(batch);
    const products = await this.productRepository.find({
      where: { internalAdImportBatchId: batch.id },
      relations: { images: true, documents: true },
    });
    const draftProducts = products.filter(
      (product) => product.status === ProductStatus.DRAFT,
    );
    const productFiles = draftProducts.flatMap((product) => [
      ...(product.images ?? []),
      ...(product.documents ?? []),
    ]);
    const retainedFileIds = new Set(
      products
        .filter((product) => product.status !== ProductStatus.DRAFT)
        .flatMap((product) => [
          ...(product.images ?? []),
          ...(product.documents ?? []),
        ])
        .map((file) => file.id),
    );
    const batchFiles = batch.files.filter(
      (file) => !retainedFileIds.has(file.id),
    );
    const files = [
      ...productFiles,
      ...batchFiles.filter(
        (file) =>
          !productFiles.some((productFile) => productFile.id === file.id),
      ),
    ];
    await this.fileService.deleteFiles(files);
    if (draftProducts.length) {
      await this.productRepository.remove(draftProducts);
    }
    await this.importBatchRepository.remove(batch);
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

  async setInternalAdPublicAvailability(
    currentUserId: string,
    productId: string,
    publiclyAvailable: boolean,
    price?: number,
  ) {
    const product = await this.internalAd(currentUserId, productId);
    const context = await this.getOrganizationContext(currentUserId);
    const canManage =
      product.createdByUserId === currentUserId ||
      context.role === OrganizationMemberRole.ADMIN;
    if (!canManage) {
      throw ForbiddenException();
    }
    if (product.status !== ProductStatus.PUBLISHED) {
      throw BadUserInputException('Product is not published');
    }
    if (publiclyAvailable && !product.publicPriceConfirmed) {
      if (
        price === undefined ||
        !Number.isInteger(price) ||
        price < 0 ||
        price * 100 > maximumProductPrice
      ) {
        throw BadUserInputException('A valid public price must be confirmed');
      }
      product.price = price * 100;
      product.isGiveaway = price === 0;
      product.publicPriceConfirmed = true;
    }

    product.publiclyAvailable = publiclyAvailable;
    return this.productRepository.save(product);
  }

  async reserveInternalAd(
    currentUserId: string,
    input: { productId: string; quantity?: number },
  ) {
    // Check organization access before taking the product lock.
    const accessibleProduct = await this.internalAd(
      currentUserId,
      input.productId,
    );
    const reservation = await this.dataSource.transaction(async (manager) => {
      // Serializing reservations on the product row prevents two simultaneous
      // partial reservations from claiming the same remaining quantity.
      const product = await manager.findOne(Product, {
        where: { id: accessibleProduct.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product || product.status !== ProductStatus.PUBLISHED) {
        throw BadUserInputException('Product is not available');
      }
      const requestedQuantity = input.quantity ?? 0;
      if (
        product.soldByQuantity &&
        (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0)
      ) {
        throw BadUserInputException('Quantity is required');
      }

      const activeReservations = await manager.find(InternalAdReservation, {
        where: {
          productId: product.id,
          canceledAt: IsNull(),
          soldAt: IsNull(),
        },
      });
      if (!product.soldByQuantity && activeReservations.length) {
        throw BadUserInputException('Product is already reserved');
      }
      if (product.soldByQuantity) {
        const reservedQuantity = activeReservations.reduce(
          (sum, activeReservation) => sum + (activeReservation.quantity ?? 0),
          0,
        );
        if (
          reservedQuantity + requestedQuantity >
          (product.primaryQuantity ?? 0)
        ) {
          throw BadUserInputException('Not enough quantity available');
        }
      }

      return manager.save(
        manager.create(InternalAdReservation, {
          productId: product.id,
          reservedByUserId: currentUserId,
          quantity: product.soldByQuantity ? input.quantity : null,
        }),
      );
    });
    await this.notifyInternalAdEvent(
      accessibleProduct,
      currentUserId,
      'reserverats',
    );
    return reservation;
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
    const batch = await this.findBatchForUser(currentUserId, batchId);
    const productsWithUpdatedValidation = batch.products.filter((product) => {
      const issues = this.validateInternalProduct(product, 0);
      if (
        issues.length === product.internalValidationIssues.length &&
        issues.every(
          (issue, index) => issue === product.internalValidationIssues[index],
        )
      ) {
        return false;
      }
      product.internalValidationIssues = issues;
      return true;
    });
    if (productsWithUpdatedValidation.length) {
      await this.productRepository.save(productsWithUpdatedValidation);
    }
    return batch;
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
      await this.importBatchRepository.update(batchId, { progress: 45 });

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
      const activeBatch = await this.importBatchRepository.findOneBy({
        id: batchId,
      });
      if (
        !activeBatch ||
        activeBatch.status === InternalAdImportBatchStatus.FAILED
      ) {
        return;
      }
      await this.importBatchRepository.update(batchId, { progress: 70 });
      const drafts = this.parseImportResponse(response.text ?? '');
      await this.createProductsFromDrafts(
        batch,
        drafts,
        leafCategories,
        batchId,
      );
      await this.importBatchRepository.update(batchId, {
        status: InternalAdImportBatchStatus.READY,
        progress: 100,
      });
    } catch (error) {
      const activeBatch = await this.importBatchRepository.findOneBy({
        id: batchId,
      });
      if (!activeBatch) return;
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
    batchId: string,
  ) {
    const imageFilesByName = new Map(
      batch.files
        .filter((file) => file.mimeType.startsWith('image/'))
        .map((file) => [file.name?.toLowerCase(), file]),
    );
    const usedImageIds = new Set<string>();

    for (const draft of drafts) {
      const activeBatch = await this.importBatchRepository.findOneBy({
        id: batchId,
      });
      if (
        !activeBatch ||
        activeBatch.status === InternalAdImportBatchStatus.FAILED
      ) {
        return;
      }
      const product = this.productRepository.create({
        title: draft.title?.trim() || 'Material från import',
        description:
          draft.description?.trim() ||
          'Beskrivning saknas i underlaget. Kontrollera och komplettera.',
        additionalInfo: draft.additionalInfo?.trim() ?? null,
        internalReferenceNumber: draft.internalReferenceNumber?.trim() ?? null,
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
      // Keep uncertain or malformed AI output reviewable rather than leaving
      // a required quantity blank.
      if (!product.primaryQuantity || !product.primaryUnit) {
        product.primaryQuantity = 1;
        product.primaryUnit = QuantityUnitEnum.AMOUNT;
      }
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
      savedProduct.internalValidationIssues = issues;
      await this.productRepository.save(savedProduct);
    }
  }

  private validateInternalProduct(product: Product, imageCount: number) {
    const issues: string[] = [];
    if (!product.title?.trim()) issues.push('Titel saknas');
    if (!product.description?.trim()) issues.push('Beskrivning saknas');
    if (!product.categoryId) issues.push('Kategori saknas');
    if (!product.primaryQuantity || !product.primaryUnit)
      issues.push('Mängd saknas');
    if (!product.condition) issues.push('Skick saknas');
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
      const isXlsx =
        file.mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      parts.push({
        text: `FILE_NAME: ${file.name ?? file.id}\nMIME_TYPE: ${isXlsx ? 'text/plain (converted from XLSX)' : file.mimeType}`,
      });
      if (isXlsx) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const csv = workbook.SheetNames.map(
          (sheetName) =>
            `SHEET: ${sheetName}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])}`,
        ).join('\n\n');
        parts.push({ text: csv });
      } else {
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
      "internalReferenceNumber": "source reference/inventory/article number, or null",
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

Always provide a reviewable suggestion for required fields: title, description, categoryId, primaryQuantification and condition. When the source is unclear, use a neutral Swedish suggestion such as "Material från import", a factual description that says the source needs review, the closest category, and "1,AMOUNT" for quantity. Do not invent exact measurements or brands; use null for those optional fields. Keep warnings for useful review notes, not missing optional data.

Set internalReferenceNumber only when the source explicitly identifies a product reference, inventory number, article number, asset ID, item number, or similarly labelled identifier tied to that product. Do not use row numbers, arbitrary codes, dimensions, quantities, invoice/order numbers, file names, or any unlabelled value that merely looks like an ID. When uncertain, return null.

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
    if (input.giveaway) {
      query.andWhere('p."isGiveaway" = TRUE');
    } else {
      if (input.minPrice !== undefined) {
        query.andWhere('p.price / 100 >= :minPrice', {
          minPrice: input.minPrice,
        });
      }
      if (input.maxPrice !== undefined) {
        query.andWhere('p.price / 100 <= :maxPrice', {
          maxPrice: input.maxPrice,
        });
      }
    }
    if (
      input.pickup !== undefined ||
      input.shipping !== undefined ||
      input.delivery !== undefined
    ) {
      query.andWhere(
        `(${input.pickup === false ? 'FALSE' : 'p."pickupEnabled" = TRUE'}
          OR ${input.shipping === false ? 'FALSE' : 'EXISTS (SELECT 1 FROM product_shipping_prices_shipping_price WHERE "productId" = p.id)'}
          OR ${input.delivery === false ? 'FALSE' : 'p."deliveryEnabled" = TRUE'})`,
      );
    }
  }

  private applyInternalProductOrdering(
    query: SelectQueryBuilder<Product>,
    input: ProductsInput,
    hasOrigin: boolean,
  ) {
    switch (input.orderBy) {
      case OrderProductsEnum.OLDEST:
        query.addOrderBy('p.publishedAt', 'ASC');
        break;
      case OrderProductsEnum.PRICE_ASC:
        query.addOrderBy('p.price', 'ASC');
        break;
      case OrderProductsEnum.PRICE_DESC:
        query.addOrderBy('p.price', 'DESC');
        break;
      case OrderProductsEnum.DISTANCE:
        query.addOrderBy(
          hasOrigin ? 'distance_from_position' : 'p.publishedAt',
          hasOrigin ? 'ASC' : 'DESC',
        );
        break;
      case OrderProductsEnum.LATEST:
      case OrderProductsEnum.BEST_MATCH:
      default:
        query.addOrderBy('p.publishedAt', 'DESC');
    }
  }

  private applyInternalProductLocation(
    query: SelectQueryBuilder<Product>,
    input: ProductsInput,
  ) {
    if (!input.location) return false;

    const origin = {
      type: 'Point',
      coordinates: [input.location.lat, input.location.lng],
    };
    const distanceExpression =
      'st_distancesphere(p."addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(p."addressLocation")))';

    query
      .andWhere('p."addressLocation" IS NOT NULL')
      .addSelect(distanceExpression, 'distance_from_position')
      .setParameter('origin', origin);

    if (input.distance !== undefined) {
      query.andWhere(`${distanceExpression} <= :distance`, {
        distance: input.distance,
      });
    }

    return true;
  }

  private internalMapCellSize(zoom?: number) {
    if (zoom === undefined) return 0.01;
    if (zoom <= 5) return 4;
    if (zoom <= 7) return 1;
    if (zoom <= 9) return 0.25;
    if (zoom <= 11) return 0.06;
    if (zoom <= 13) return 0.015;
    return 0.004;
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
      order: { products: { createdAt: 'ASC' } },
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
