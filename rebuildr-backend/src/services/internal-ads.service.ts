import {
  GoogleGenAI,
  Part,
  PartMediaResolutionLevel,
  ThinkingLevel,
} from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import * as z from 'zod';
import { QuantityUnitEnum } from 'src/constants/enums';
import { maximumProductPrice } from 'src/constants/pricing';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import {
  InternalAdImportBatch,
  InternalAdImportBatchStatus,
} from 'src/entities/internal-ad-import-batch.entity';
import { InternalAdReservation } from 'src/entities/internal-ad-reservation.entity';
import { OrganizationMember } from 'src/entities/organization-member.entity';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { MapPin, MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { Project } from 'src/entities/project.entity';
import { User, UserType } from 'src/entities/user.entity';
import {
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
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
import { AIService } from './ai.service';
import { BrandService } from './brand.service';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';
import { MailService } from './mail.service';
import { StripeService } from './stripe.service';

const GEMINI_TIMEOUT_MS = 120_000;
const IMPORT_FILE_FETCH_TIMEOUT_MS = 20_000;

export interface OrganizationContext {
  organization: User;
  canReceivePayout?: boolean;
  role?: string;
  isOrganizationAccount?: boolean;
}

interface ImportDraft {
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
}

@Injectable()
export class InternalAdsService {
  private gemini = new GoogleGenAI({});

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
    @InjectRepository(InternalAdReservation)
    private reservationRepository: Repository<InternalAdReservation>,
    @InjectRepository(InternalAdImportBatch)
    private importBatchRepository: Repository<InternalAdImportBatch>,
    private fileService: FileService,
    private aiService: AIService,
    private brandService: BrandService,
    private geocodingService: GeocodingService,
    private mailService: MailService,
    private stripeService: StripeService,
    private dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getOrganizationContext(userId: string): Promise<OrganizationContext> {
    const organization = await this.userRepository.findOneBy({ id: userId });
    if (!organization) throw BadUserInputException('Invalid user');
    if (!organization.internalAdsAccess) {
      throw ForbiddenException('No access to internal ads');
    }
    return { organization };
  }

  async getOptionalOrganizationContext(userId?: string) {
    if (!userId) return null;
    try {
      const context = await this.getOrganizationContext(userId);
      return {
        ...context,
        canReceivePayout: await this.organizationCanReceivePayout(
          context.organization,
        ),
      };
    } catch {
      return null;
    }
  }

  private async organizationCanReceivePayout(organization: User) {
    if (!organization.connectedAccountId) return false;
    try {
      return await this.stripeService.accountCanReceivePayout(
        organization.connectedAccountId,
      );
    } catch {
      return false;
    }
  }

  async assertProductAccess(product: Product, userId: string) {
    if (product.visibility !== ProductVisibility.INTERNAL) return;
    const context = await this.getOrganizationContext(userId);
    if (context.organization.id !== product.internalOrganizationId) {
      throw ForbiddenException('Internal product belongs to another organization');
    }
  }

  async members(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    return this.organizationMemberRepository.find({
      where: { organizationId: context.organization.id },
      order: { createdAt: 'ASC' },
    });
  }

  async createMember(currentUserId: string, input: { name: string; email: string }) {
    const context = await this.getOrganizationContext(currentUserId);
    const name = input.name.trim();
    const parsedEmail = z.string().email().safeParse(input.email.trim());
    if (!name || !parsedEmail.success) {
      throw BadFieldsInputException([
        ...(!name ? [{ name: 'name', message: 'Ange ett namn' }] : []),
        ...(!parsedEmail.success ? [{ name: 'email', message: 'Ange en giltig e-postadress' }] : []),
      ]);
    }
    return this.organizationMemberRepository.save(this.organizationMemberRepository.create({
      organizationId: context.organization.id,
      name,
      email: parsedEmail.data.toLowerCase(),
    }));
  }

  async updateMember(currentUserId: string, input: { id: string; name: string; email: string }) {
    const context = await this.getOrganizationContext(currentUserId);
    const member = await this.organizationMemberRepository.findOneBy({
      id: input.id,
      organizationId: context.organization.id,
    });
    if (!member) throw NotFoundException('Organization member not found');
    const name = input.name.trim();
    const parsedEmail = z.string().email().safeParse(input.email.trim());
    if (!name || !parsedEmail.success) throw BadUserInputException('Invalid member');
    member.name = name;
    member.email = parsedEmail.data.toLowerCase();
    return this.organizationMemberRepository.save(member);
  }

  async removeMember(currentUserId: string, memberId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const result = await this.organizationMemberRepository.delete({
      id: memberId,
      organizationId: context.organization.id,
    });
    if (!result.affected) throw NotFoundException('Organization member not found');
    return true;
  }

  private async findOrganizationMember(organizationId: string, memberId: string) {
    const member = await this.organizationMemberRepository.findOneBy({
      id: memberId,
      organizationId,
    });
    if (!member) throw BadUserInputException('Invalid organization member');
    return member;
  }

  async internalProjects(
    currentUserId: string,
    input: { searchString?: string },
    limit = 20,
    offset = 0,
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    const query = this.projectRepository
      .createQueryBuilder('project')
      .where('project."internalOrganizationId" = :organizationId', {
        organizationId: context.organization.id,
      })
      .orderBy('project."createdAt"', 'DESC')
      .take(Math.min(limit, 40))
      .skip(offset * limit);
    if (input.searchString?.trim()) {
      query.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search)',
        { search: `%${input.searchString.trim()}%` },
      );
    }
    const [projects, total] = await query.getManyAndCount();
    return { projects, total };
  }

  async internalProject(currentUserId: string, projectId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const project = await this.projectRepository.findOneBy({
      id: projectId,
      internalOrganizationId: context.organization.id,
    });
    if (!project) throw NotFoundException('Internal project not found');
    return project;
  }

  async internalProjectProducts(currentUserId: string, projectId: string) {
    const project = await this.internalProject(currentUserId, projectId);
    return this.productRepository.find({
      where: {
        projectId: project.id,
        visibility: ProductVisibility.INTERNAL,
        internalOrganizationId: project.internalOrganizationId,
        status: In([ProductStatus.PUBLISHED, ProductStatus.SOLD]),
        hiddenReason: IsNull(),
      },
      relations: { images: true },
      order: { status: 'ASC', createdAt: 'DESC' },
    });
  }

  async createInternalProject(
    currentUserId: string,
    input: {
      title: string;
      description?: string;
      location: { lat: number; lng: number };
    },
  ) {
    const context = await this.getOrganizationContext(currentUserId);
    const title = input.title.trim();
    if (!title) throw BadUserInputException('Project title is required');
    const { exact, approximate } =
      await this.geocodingService.exactAndApproximatePlace(input.location);
    return this.projectRepository.save(
      this.projectRepository.create({
        title,
        description: input.description?.trim() || null,
        address: exact.address,
        addressLocation: {
          type: 'Point',
          coordinates: [input.location.lat, input.location.lng],
        },
        mapPin: new MapPin({
          address: approximate.address,
          location: {
            type: 'Point',
            coordinates: [approximate.lat, approximate.lng],
          },
        }),
        userId: context.organization.id,
        internalOrganizationId: context.organization.id,
      }),
    );
  }

  async updateInternalProject(
    currentUserId: string,
    input: {
      id: string;
      title?: string;
      description?: string;
      location?: { lat: number; lng: number };
    },
  ) {
    const project = await this.internalProject(currentUserId, input.id);
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw BadUserInputException('Project title is required');
      project.title = title;
    }
    if (input.description !== undefined)
      project.description = input.description;
    if (input.location) {
      const { exact } = await this.geocodingService.exactAndApproximatePlace(
        input.location,
      );
      project.address = exact.address;
      project.addressLocation = {
        type: 'Point',
        coordinates: [input.location.lat, input.location.lng],
      };
    }
    return this.projectRepository.save(project);
  }

  async deleteInternalProject(currentUserId: string, projectId: string) {
    const project = await this.internalProject(currentUserId, projectId);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Product).update(
        {
          projectId: project.id,
          internalOrganizationId: project.internalOrganizationId,
        },
        { projectId: null, noProject: true },
      );
      await manager.getRepository(Project).remove(project);
    });

    return true;
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
    product.address = context.organization.address;
    product.addressLocation = context.organization.addressLocation;
    product.pickupEnabled = true;
    product.internalValidationIssues = this.validateInternalProduct(product);
    return this.productRepository.save(product);
  }

  async setInternalAdResponsibleMember(
    currentUserId: string,
    productId: string,
    organizationMemberId: string,
  ) {
    const product = await this.internalAd(currentUserId, productId);
    const member = await this.findOrganizationMember(
      product.internalOrganizationId!,
      organizationMemberId,
    );
    product.createdByOrganizationMemberId = member.id;
    product.createdByOrganizationMemberName = member.name;
    product.createdByOrganizationMemberEmail = member.email;
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

  async internalAdsCategories(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const categoryCounts = await this.productRepository
      .createQueryBuilder('p')
      .innerJoin(Category, 'c', 'p."categoryId" = c.id')
      .select('COALESCE(c."parentId", c.id)', 'categoryId')
      .addSelect('COUNT(p.id)', 'adCount')
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
      .groupBy('COALESCE(c."parentId", c.id)')
      .orderBy('COUNT(p.id)', 'DESC')
      .addOrderBy('COALESCE(c."parentId", c.id)', 'ASC')
      .getRawMany<{ categoryId: string; adCount: string }>();

    const categories = await this.categoryRepository.find({
      where: { parentId: IsNull() },
      relations: { image: true },
      order: { orderIndex: 'ASC' },
    });
    const categoriesById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const categoriesWithAds = categoryCounts.flatMap(
      ({ categoryId, adCount }) => {
        const category = categoriesById.get(categoryId);
        return category ? [{ category, adCount: Number(adCount) }] : [];
      },
    );
    const categoryIdsWithAds = new Set(
      categoriesWithAds.map(({ category }) => category.id),
    );

    return [
      ...categoriesWithAds,
      ...categories
        .filter((category) => !categoryIdsWithAds.has(category.id))
        .map((category) => ({ category, adCount: 0 })),
    ];
  }

  async internalAdsStatistics(currentUserId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const quantityFactor = `CASE
      WHEN p."soldByQuantity" = TRUE THEN COALESCE(p."primaryQuantity", 0)
      ELSE 1
    END`;
    const soldQuantity = `COALESCE((
      SELECT SUM(reservation.quantity)
      FROM "internal_ad_reservation" reservation
      WHERE reservation."productId" = p.id
        AND reservation."soldAt" IS NOT NULL
        AND reservation."canceledAt" IS NULL
    ), 0)`;

    const statistics = await this.productRepository
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'totalAds')
      .addSelect(
        `COUNT(p.id) FILTER (
          WHERE p.status = :publishedStatus
            AND p."publiclyAvailable" = TRUE
        )`,
        'externallyPublishedAds',
      )
      .addSelect(
        `COALESCE(SUM(CASE
          WHEN p.status = :publishedStatus
            THEN CAST(p.price AS NUMERIC) * (${quantityFactor})
          ELSE 0
        END), 0)`,
        'estimatedMarketValue',
      )
      .addSelect(
        `COALESCE(SUM(CASE
          WHEN p.status = :publishedStatus
            THEN COALESCE(p."co2SavingSeller", 0) * (${quantityFactor})
          ELSE 0
        END), 0)`,
        'potentialCo2Savings',
      )
      .addSelect(
        `COALESCE(SUM(CASE
          WHEN p."soldByQuantity" = FALSE AND p.status = :soldStatus
            THEN COALESCE(p."co2SavingSeller", 0)
          WHEN p."soldByQuantity" = TRUE
            THEN COALESCE(p."co2SavingSeller", 0) * (
              (${soldQuantity}) + CASE
                WHEN p.status = :soldStatus
                  THEN COALESCE(p."primaryQuantity", 0)
                ELSE 0
              END
            )
          ELSE 0
        END), 0)`,
        'co2Saved',
      )
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
      .setParameters({
        publishedStatus: ProductStatus.PUBLISHED,
        soldStatus: ProductStatus.SOLD,
      })
      .getRawOne<{
        co2Saved: string | number | null;
        potentialCo2Savings: string | number | null;
        estimatedMarketValue: string | number | null;
        totalAds: string | number | null;
        externallyPublishedAds: string | number | null;
      }>();

    return {
      co2Saved: Number(statistics?.co2Saved ?? 0),
      potentialCo2Savings: Number(statistics?.potentialCo2Savings ?? 0),
      estimatedMarketValue: Number(statistics?.estimatedMarketValue ?? 0),
      totalAds: Number(statistics?.totalAds ?? 0),
      externallyPublishedAds: Number(statistics?.externallyPublishedAds ?? 0),
    };
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
      .select('ST_X(ST_Centroid(ST_Collect(p."addressLocation")))', 'latitude')
      .addSelect(
        'ST_Y(ST_Centroid(ST_Collect(p."addressLocation")))',
        'longitude',
      )
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
      .andWhere('p."addressLocation" IS NOT NULL')
      .andWhere(
        'p."addressLocation" && ST_MakeEnvelope(:swLat, :swLng, :neLat, :neLng, 4326)',
        {
          swLat: input.southWest.lat,
          swLng: input.southWest.lng,
          neLat: input.northEast.lat,
          neLng: input.northEast.lng,
        },
      )
      .groupBy('ST_SnapToGrid(p."addressLocation", :cellSize)')
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
        createdByOrganizationMember: true,
        internalReservations: { reservedByOrganizationMember: true },
        shippingPrices: true,
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
        issues: [
          ...this.validateInternalProduct(product),
          ...(product.createdByOrganizationMemberId
            ? []
            : ['Välj vem som lagt upp annonsen']),
        ],
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

    const batchIds = [
      ...new Set(
        products
          .map((product) => product.internalAdImportBatchId)
          .filter(Boolean),
      ),
    ];
    products.forEach((product) => {
      product.status = ProductStatus.PUBLISHED;
      product.price = 0;
      product.isGiveaway = true;
      product.internalValidationIssues = [];
      product.internalAdImportBatchId = null;
    });
    const savedProducts = await this.productRepository.save(products);
    savedProducts.forEach((product) => this.queuePriceSuggestion(product.id));
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
    if (product.status !== ProductStatus.PUBLISHED) {
      throw BadUserInputException('Product is not published');
    }
    if (publiclyAvailable) {
      if (!(await this.organizationCanReceivePayout(context.organization))) {
        throw BadUserInputException(
          'Organization payout account must be able to receive payouts',
        );
      }
      this.assertPublicTransportation(product);
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

    // An internal ad enters the public marketplace when this is enabled. Treat
    // that as its public publication time so it is included among new arrivals.
    if (publiclyAvailable && !product.publiclyAvailable) {
      product.publishedAt = new Date();
    }
    product.publiclyAvailable = publiclyAvailable;
    return this.productRepository.save(product);
  }

  private assertPublicTransportation(product: Product) {
    if (
      !product.pickupEnabled &&
      !product.shippingPrices?.length &&
      !product.deliveryEnabled
    ) {
      throw BadUserInputException(
        'At least one public transportation option is required',
      );
    }
    if (
      (product.pickupEnabled || product.deliveryEnabled) &&
      (!product.address || !product.addressLocation) &&
      !product.projectId
    ) {
      throw BadUserInputException(
        'A pickup or delivery address is required for public availability',
      );
    }
  }

  async reserveInternalAd(
    currentUserId: string,
    input: { productId: string; quantity?: number; organizationMemberId: string },
  ) {
    // Check organization access before taking the product lock.
    const accessibleProduct = await this.internalAd(
      currentUserId,
      input.productId,
    );
    const member = await this.findOrganizationMember(
      accessibleProduct.internalOrganizationId!,
      input.organizationMemberId,
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
          reservedByOrganizationMemberId: member.id,
          reservedByOrganizationMemberName: member.name,
          reservedByOrganizationMemberEmail: member.email,
          quantity: product.soldByQuantity ? input.quantity : null,
        }),
      );
    });
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
    reservation.canceledAt = new Date();
    return this.reservationRepository.save(reservation);
  }

  async markInternalAdSold(
    currentUserId: string,
    input: { productId: string; reservationId?: string },
  ) {
    const product = await this.internalAd(currentUserId, input.productId);
    const context = await this.getOrganizationContext(currentUserId);

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
    return saved;
  }

  async createImportBatch(currentUserId: string, files: FileInputType[], memberId: string) {
    const context = await this.getOrganizationContext(currentUserId);
    const member = await this.findOrganizationMember(context.organization.id, memberId);
    const dbFiles = await this.fileService.createFiles(files, true);
    const batch = this.importBatchRepository.create({
      organizationId: context.organization.id,
      organizationMemberId: member.id,
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
      const issues = this.validateInternalProduct(product);
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
      relations: { files: true, organization: true, organizationMember: true },
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
        createdByOrganizationMemberId: batch.organizationMemberId,
        createdByOrganizationMemberName: batch.organizationMember.name,
        createdByOrganizationMemberEmail: batch.organizationMember.email,
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
      const issues = this.validateInternalProduct(savedProduct);
      savedProduct.internalValidationIssues = issues;
      await this.productRepository.save(savedProduct);
    }
  }

  private queuePriceSuggestion(productId: string) {
    setImmediate(() => {
      void this.aiService.suggestProductPrice(productId).catch((error) => {
        this.logger.error('Internal ad price suggestion failed', {
          error: error instanceof Error ? error.message : error,
          productId,
        });
      });
    });
  }

  private validateInternalProduct(product: Product) {
    const issues: string[] = [];
    if (!product.title?.trim()) issues.push('Titel saknas');
    if (!product.description?.trim()) issues.push('Beskrivning saknas');
    if (!product.categoryId) issues.push('Kategori saknas');
    if (!product.primaryQuantity || !product.primaryUnit)
      issues.push('Mängd saknas');
    if (!product.condition) issues.push('Skick saknas');
    if (!product.projectId && (!product.address || !product.addressLocation))
      issues.push('Plats saknas');
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
    if (input.availability) {
      query.andWhere('p.availability = :availability', {
        availability: input.availability,
      });
    }
    if (input.publiclyAvailable !== undefined) {
      query.andWhere('p."publiclyAvailable" = :publiclyAvailable', {
        publiclyAvailable: input.publiclyAvailable,
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
      relations: { reservedByOrganizationMember: true },
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

}
