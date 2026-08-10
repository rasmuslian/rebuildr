import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import {
  Product,
  ProductAvailabilityEnum,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import {
  BadField,
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from 'src/exceptions';
import {
  CmsCreateProductInput,
  CmsCreateProductResponse,
  CmsListProductsInput,
  CmsListProductsResponse,
  CmsUpdateProductInput,
  CmsUpdateProductResponse,
  GetTransportationOptionsInput,
  OrderProductsEnum,
  PaginatedProductsResponse,
  ProductsInput,
  UpdateProductInput,
} from 'src/resolvers/product.resolver';
import {
  DataSource,
  Equal,
  In,
  IsNull,
  LessThanOrEqual,
  Not,
  Point,
  Repository,
  ILike,
  SelectQueryBuilder,
} from 'typeorm';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';
import { PurchaseService } from './purchase.service';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { Logger } from 'winston';
import * as z from 'zod';
import {
  maximumProductPrice,
  minimumProductPrice,
} from 'src/constants/pricing';
import { File } from '../entities/file.entity';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { ShippingService } from './shipping.service';
import {
  ProductsRecommendationSourceEnum,
  RecommendedProductsInput,
} from 'src/resolvers/user.resolver';
import { SearchResultService } from './search-result.service';
import { ProjectService } from './project.service';
import { FileInputType } from 'src/resolvers/file.resolver';
import { CO2FactorService } from './co2-factor.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserService } from './user.service';
import { ShippingPriceService } from './shipping-price.service';
import { ConversationService } from './conversation.service';
import { SearchEnrichmentService } from './search-enrichment.service';
import { Brand } from 'src/entities/brand.entity';
import { OrganizationMemberRole } from 'src/entities/organization-membership.entity';

export const PRODUCT_SEARCH_RANK_THRESHOLD = 0.25;
const RELATED_PRODUCT_SEARCH_RANK_THRESHOLD = 0.05;

interface FindProductsQueryOptions {
  excludeProductIds?: string[];
  ignoreTransportation?: boolean;
  searchRankThreshold?: number;
}

export const AD_EXPIRED_HIDDEN_REASON = 'AD_EXPIRED';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    private geocodingService: GeocodingService,
    private fileService: FileService,
    private conversationService: ConversationService,
    private purchaseService: PurchaseService,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(ShippingPrice)
    private shippingPriceRepository: Repository<ShippingPrice>,
    private shippingService: ShippingService,
    @Inject(forwardRef(() => SearchResultService))
    private searchResultService: SearchResultService,
    private dataSource: DataSource,
    private projectService: ProjectService,
    private co2Service: CO2FactorService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private shippingPriceService: ShippingPriceService,
    private searchEnrichmentService: SearchEnrichmentService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getDraft(currentUserId: string) {
    return await this.productRepository.findOne({
      where: {
        sellerId: currentUserId,
        status: ProductStatus.DRAFT,
        visibility: ProductVisibility.PUBLIC,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createDraft(currentUserId: string) {
    const seller = await this.userRepository.findOneBy({ id: currentUserId });
    if (!seller) {
      throw BadUserInputException();
    }

    const existingDrafts = await this.productRepository.find({
      where: {
        sellerId: seller.id,
        status: ProductStatus.DRAFT,
        visibility: ProductVisibility.PUBLIC,
      },
    });

    //delete all existing drafts
    await this.deleteMany(existingDrafts);

    const product = new Product();
    product.title = '';
    product.price = 0;
    product.status = ProductStatus.DRAFT;
    product.visibility = ProductVisibility.PUBLIC;
    product.seller = seller;
    product.address = seller.address;
    product.addressLocation = seller.addressLocation;

    return await this.productRepository.save(product);
  }
  async getOrCreateDraft(currentUserId: string) {
    const draft = await this.getDraft(currentUserId);
    if (draft) {
      return draft;
    }
    return await this.createDraft(currentUserId);
  }

  /**
   * Server-side publish gate: requires a verified email and applies a velocity
   * cap for brand-new accounts.
   *
   * TODO: stronger seller verification (phone OTP / BankID before first
   * publish) can plug in here.
   */
  private async assertCanPublish(sellerId: string) {
    const seller = await this.userRepository.findOneBy({ id: sellerId });
    if (!seller || !seller.emailVerifiedAt) {
      throw BadUserInputException('Seller is not verified');
    }
    const accountAgeMs = Date.now() - seller.createdAt.getTime();
    const isNewAccount = accountAgeMs < 7 * 24 * 60 * 60 * 1000;
    if (isNewAccount) {
      const NEW_ACCOUNT_PUBLISH_CAP = 20;
      const publishedCount = await this.productRepository.count({
        where: {
          sellerId,
          status: In([ProductStatus.PUBLISHED, ProductStatus.SOLD]),
        },
      });
      if (publishedCount >= NEW_ACCOUNT_PUBLISH_CAP) {
        throw BadUserInputException(
          'Publish limit reached for new accounts. Please contact support.',
        );
      }
    }
  }

  async updateProduct(
    input: UpdateProductInput,
    currentUserId: string,
    currentUserRole: UserRoleEnum,
    logger: Logger,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: input.id },
      relations: {
        images: true,
        documents: true,
        purchases: true,
        //category must be loaded — the PUBLISHED validation below checks it,
        //and not every update includes a categoryId in the input
        category: true,
      },
    });

    if (!product) {
      throw BadUserInputException();
    }

    const canManageInternalProduct =
      product.visibility === ProductVisibility.INTERNAL &&
      (await this.canManageInternalProduct(product, currentUserId));

    if (
      currentUserRole !== UserRoleEnum.ADMIN &&
      currentUserId !== product.sellerId &&
      !canManageInternalProduct
    ) {
      logger.error('User does not have permission to update product', {
        currentUserId,
        currentUserRole,
        productId: product.id,
        productSellerId: product.sellerId,
      });

      throw ForbiddenException();
    }
    const ongoingPurchase = product.purchases.find(
      (purchase) => purchase.status !== PurchaseStatusEnum.FINISHED_FAILED,
    );
    if (ongoingPurchase) {
      logger.error('Can not update product due to ongoing purchase', {
        purchase: ongoingPurchase,
        productId: product.id,
      });
      throw ForbiddenException();
    }

    const convertedPrice =
      input.price !== undefined ? input.price * 100 : undefined;

    //--------------- VERIFY INPUTS --------------------
    const errors: BadField[] = [];
    if (input.title === '') {
      errors.push({
        message: 'Tom titel',
        name: 'title',
      });
    }
    if (input.description === '') {
      errors.push({
        message: 'Måste ha beskrivning',
        name: 'description',
      });
    }
    if (convertedPrice !== undefined && !input.isGiveAway) {
      if (convertedPrice < minimumProductPrice) {
        errors.push({
          message: `Priset måste vara 0 kr (bortskänkes) eller minst ${this.getProductPriceRange().min} kr`,
          name: 'price',
        });
      }
      if (convertedPrice > maximumProductPrice) {
        errors.push({
          message: `Priset måste vara lägre än ${Math.round(maximumProductPrice / 100)} kr`,
          name: 'price',
        });
      }
    }
    if (input.addImages || input.removeImages?.length) {
      const addAmount = input.addImages?.length ?? 0;
      const removeAmount = input.removeImages?.length ?? 0;
      const newAmount = product.images.length + addAmount - removeAmount;
      if (newAmount <= 0) {
        errors.push({
          message: 'Måste bifoga minst en bild',
          name: 'images',
        });
      }
      if (newAmount > 10) {
        errors.push({
          message: 'Max antal bilder uppnått',
          name: 'images',
        });
      }
    }
    if (input.primaryQuantity && input.primaryQuantity <= 0) {
      errors.push({
        message: 'Måste ange minst ett',
        name: 'primary',
      });
    }

    if (
      input.isGiveAway &&
      input.deliveryPrice &&
      input.deliveryPrice * 100 < minimumProductPrice
    ) {
      errors.push({
        message: `Minsta tillåtna hemtransportpris är ${this.getProductPriceRange().min} kr om annonsen bortskänkes`,
        name: 'delivery',
      });
    }

    if (errors.length) {
      throw BadFieldsInputException(errors);
    }
    //------------------------------------------------

    if (input.title !== undefined) {
      product.title = input.title;
    }
    if (input.description !== undefined) {
      product.description = input.description;
    }
    if (input.additionalInfo !== undefined) {
      product.additionalInfo = input.additionalInfo;
    }
    if (
      product.visibility === ProductVisibility.INTERNAL &&
      input.internalReferenceNumber !== undefined
    ) {
      product.internalReferenceNumber = input.internalReferenceNumber;
    }
    if (convertedPrice !== undefined) {
      product.price = convertedPrice;
      product.isGiveaway = convertedPrice <= 0;
    }
    if (input.status) {
      product.status = input.status;
    }
    if (input.availability !== undefined) {
      product.availability = input.availability;
    }
    if (input.estimatedAvailableAt !== undefined) {
      product.estimatedAvailableAt = input.estimatedAvailableAt;
    }
    if (input.availabilityPrecision !== undefined) {
      product.availabilityPrecision = input.availabilityPrecision;
    }
    if (input.availableUntil !== undefined) {
      product.availableUntil = input.availableUntil;
    }
    //null means removing the brand
    if (!!input.brandId || input.brandId === null) {
      product.brandId = input.brandId;
    }
    if (input.condition) {
      product.condition = input.condition;
    }
    if (input.isGiveAway !== undefined) {
      product.isGiveaway = input.isGiveAway;
      product.price = input.isGiveAway ? 0 : product.price;
    }

    //null means removing the category
    if (!!input.categoryId || input.categoryId === null) {
      if (input.categoryId === null) {
        product.categoryId = null;
        product.category = null;
      } else {
        const category = await this.categoryRepository.findOne({
          where: { id: Equal(input.categoryId) },
        });
        if (!category) {
          throw BadUserInputException('Category not found');
        }
        product.categoryId = category.id;
        product.category = category;
      }
    }

    //Project
    if (input.noProject !== null) {
      product.noProject = input.noProject;
    }
    //null means removing the project
    if (!!input.projectId || input.projectId === null) {
      product.noProject = !input.projectId;
      product.projectId = input.projectId;
      if (!input.projectId) {
        product.project = null;
      }
    }

    //Measurements
    if (input.height !== undefined) {
      product.height = input.height;
    }
    if (input.heightUnit !== undefined) {
      product.heightUnit = input.heightUnit;
    }
    if (input.width !== undefined) {
      product.width = input.width;
    }
    if (input.widthUnit !== undefined) {
      product.widthUnit = input.widthUnit;
    }
    if (input.length !== undefined) {
      product.length = input.length;
    }
    if (input.lengthUnit !== undefined) {
      product.lengthUnit = input.lengthUnit;
    }
    if (input.thickness !== undefined) {
      product.thickness = input.thickness;
    }
    if (input.thicknessUnit !== undefined) {
      product.thicknessUnit = input.thicknessUnit;
    }
    if (input.diameter !== undefined) {
      product.diameter = input.diameter;
    }
    if (input.diameterUnit !== undefined) {
      product.diameterUnit = input.diameterUnit;
    }
    if (input.weight !== undefined) {
      product.weight = input.weight;
    }
    if (input.weightUnit !== undefined) {
      product.weightUnit = input.weightUnit;
    }

    //Quantities
    if (input.primaryUnit && input.primaryQuantity) {
      product.primaryUnit = input.primaryUnit;
      product.primaryQuantity = input.primaryQuantity;
    }
    if (
      input.secondaryUnit !== undefined &&
      input.secondaryQuantity !== undefined
    ) {
      product.secondaryUnit = input.secondaryUnit;
      product.secondaryQuantity = input.secondaryQuantity;
    }

    //Color
    if (input.color !== undefined) {
      product.color = input.color || null;
    }
    if (input.colorType !== undefined) {
      product.colorType = input.colorType;
    }

    //CO2
    if (input.weight || input.categoryId) {
      const co2 = await this.getProductCO2(product);
      product.co2SavingSeller = co2?.co2SavingSeller ?? product.co2SavingSeller;
      product.co2SavingBuyer = co2?.co2SavingBuyer ?? product.co2SavingBuyer;
    }

    //Transportations
    if (input.location) {
      product.address = (
        await this.geocodingService.locationToAddress(input.location)
      ).address;
      product.addressLocation = {
        type: 'Point',
        coordinates: [input.location.lat, input.location.lng],
      };
    }
    if (input.pickupEnabled !== undefined && input.pickupEnabled !== null) {
      product.pickupEnabled = input.pickupEnabled;
    }
    if (input.deliveryEnabled !== undefined && input.deliveryEnabled !== null) {
      product.deliveryEnabled = input.deliveryEnabled;
    }
    if (input.deliveryRadius > 0) {
      product.deliveryRadius = input.deliveryRadius;
    }
    if (input.deliveryPrice !== undefined) {
      product.deliveryPrice = input.deliveryPrice * 100;
    }
    if (input.shippingPriceIds) {
      const shippingPrices = await this.shippingPriceRepository.find({
        where: { id: In(input.shippingPriceIds) },
      });
      product.shippingPrices = shippingPrices;
    }

    if (input.soldByQuantity !== undefined) {
      product.soldByQuantity = input.soldByQuantity;
    }

    //By this point we can validate the product, but only if it is to be published
    if (product.status === ProductStatus.PUBLISHED) {
      if (product.visibility !== ProductVisibility.INTERNAL) {
        await this.assertCanPublish(product.sellerId);
      }

      const parseResult = z
        .object({
          title: z.string().min(1),
          description: z.string().min(1),
        })
        .safeParse(product);
      if (!parseResult.success) {
        logger.error({
          message: 'Invalid update of product',
          errors: parseResult.error.errors,
        });

        throw BadUserInputException('Invalid update of product');
      }

      if (!product.category) {
        logger.error('updateProduct: missing category', {
          productId: product.id,
          updateProductInput: input,
        });
        throw BadUserInputException('Missing category');
      }
      if (!product.category.parentId) {
        logger.error('updateProduct: category is not child', {
          productId: product.id,
          category: product.category,
          updateProductInput: input,
        });
        throw BadUserInputException('Category is not child');
      }

      if (!product.condition) {
        logger.error({
          message: 'Product condition is missing',
        });

        throw BadUserInputException('Product condition is missing');
      }

      if (
        product.images?.length +
          (input.addImages?.length ?? 0) -
          (input.removeImages?.length ?? 0) <
        1
      ) {
        logger.error({
          message: 'Product must have at least one image',
        });

        throw BadUserInputException('Product must have at least one image');
      }

      if (
        product.visibility !== ProductVisibility.INTERNAL &&
        !product.isGiveaway &&
        product.price < minimumProductPrice
      ) {
        logger.error({
          message: 'Too low price',
          price: product.price,
          minimumProductPrice: minimumProductPrice,
        });

        throw BadUserInputException('Too low price');
      }
      if (
        product.visibility !== ProductVisibility.INTERNAL &&
        !product.isGiveaway &&
        product.price > maximumProductPrice
      ) {
        logger.error({
          message: 'Too high price',
          price: product.price,
          maximumProductPrice,
        });

        throw BadUserInputException('Too high price');
      }

      if (!product.primaryQuantity || !product.primaryUnit) {
        throw BadUserInputException('Product must specify quantity');
      }

      // Internal ads are reserved within an organization and do not use the
      // public pickup/shipping/delivery flow. In particular, an organization
      // may not have an address set, so do not block internal-ad edits on the
      // public transportation requirements.
      if (product.visibility !== ProductVisibility.INTERNAL) {
        if (
          !product.pickupEnabled &&
          !product.shippingPrices.length &&
          !product.deliveryEnabled
        ) {
          logger.error('Product must have a transportation option', {
            product,
          });
          throw BadUserInputException(
            'Product must have a transportation option',
          );
        }
        if (product.pickupEnabled || product.deliveryEnabled) {
          if (
            (!product.address || !product.addressLocation) &&
            !product.projectId
          ) {
            logger.error(
              'Product must have an adress for pickup and delivery',
              { product },
            );
            throw BadUserInputException('Product missing address');
          }
        }
      }
    }

    const updateFiles = async (
      removeFileIds: string[],
      addFilesInput: FileInputType[],
      files: File[],
    ) => {
      //removing
      const removeFiles = files.filter((file) =>
        removeFileIds.some((removeId) => removeId === file.id),
      );
      const updatedFiles = files.filter((file) =>
        removeFiles.every((removeFile) => removeFile.id !== file.id),
      );
      await this.fileService.deleteFiles(removeFiles);

      //adding
      const createFiles = await this.fileService.createFiles(
        addFilesInput ?? [],
      );
      updatedFiles.push(...createFiles);

      return updatedFiles;
    };

    const updatedImages = await updateFiles(
      input.removeImages ?? [],
      input.addImages ?? [],
      product.images,
    );
    product.images = updatedImages;
    const updatedDocuments = await updateFiles(
      input.removeDocuments ?? [],
      input.addDocuments ?? [],
      product.documents,
    );
    product.documents = updatedDocuments;

    await this.enrichProductSearchMetadata(product);

    const savedProduct = await this.productRepository.save(product);

    return {
      product: savedProduct,
      imagePutUrls: this.fileService.uploadFiles(product.images, true),
      documentPutUrls: this.fileService.uploadFiles(product.documents, true),
    };
  }

  async getProductCO2(product: Product) {
    if (product.weight && product.categoryId) {
      try {
        const co2Factor = await this.co2Service.getCO2Factor({
          categoryId: product.categoryId,
        });

        return {
          co2SavingBuyer: product.weight * co2Factor.productionCoefficient,
          co2SavingSeller: product.weight * co2Factor.disposalCoefficient,
        };
      } catch {
        this.logger.error('co2 factor not found', {
          categoryId: product.categoryId,
          productId: product.id,
        });
      }
    }
    return null;
  }

  getProductPriceRange() {
    return {
      min: Math.round(minimumProductPrice / 100),
      max: Math.round(maximumProductPrice / 100),
    };
  }

  basicFindProductsInputQueryBuilder<T>(
    input: ProductsInput,
    qb: SelectQueryBuilder<T>,
    productAlias: string,
    options: FindProductsQueryOptions = {},
  ) {
    qb.andWhere(
      input.onlyPublished
        ? `${productAlias}.status = 'PUBLISHED'`
        : `(${productAlias}.status = 'PUBLISHED' OR ${productAlias}.status = 'SOLD')`,
    );
    // Generic marketplace queries must never expose a private internal ad.
    // Internal ads are queried exclusively through InternalAdsService, which
    // applies organization membership checks. The explicit public opt-in is
    // the only exception.
    qb.andWhere(
      `(${productAlias}.visibility = '${ProductVisibility.PUBLIC}' OR (${productAlias}.visibility = '${ProductVisibility.INTERNAL}' AND ${productAlias}."publiclyAvailable" = true))`,
    );
    qb.andWhere(`${productAlias}."hiddenReason" IS NULL`);

    if (input.sellerId) {
      qb.andWhere(`${productAlias}."sellerId" = :sellerId`, {
        sellerId: input.sellerId,
      });
    }

    if (input.projectId) {
      qb.andWhere(`${productAlias}."projectId" = :projectId`, {
        projectId: input.projectId,
      });
    }

    if (options.excludeProductIds?.length) {
      qb.andWhere(`${productAlias}.id NOT IN (:...excludeProductIds)`, {
        excludeProductIds: options.excludeProductIds,
      });
    }

    if (input.searchString) {
      qb.addCommonTableExpression(
        `SELECT
            p.id,
            (
              CASE WHEN lower(p.title) = lower(:searchString) THEN 8 ELSE 0 END +
              CASE WHEN p.title ILIKE (:searchString || '%') THEN 5 ELSE 0 END +
              CASE WHEN p.title ILIKE ('%' || :searchString || '%') THEN 4 ELSE 0 END +
              CASE WHEN c.name ILIKE ('%' || :searchString || '%') THEN 3.5 ELSE 0 END +
              CASE WHEN parent.name ILIKE ('%' || :searchString || '%') THEN 2.5 ELSE 0 END +
              CASE WHEN b.name ILIKE ('%' || :searchString || '%') THEN 2.25 ELSE 0 END +
              CASE WHEN EXISTS (SELECT 1 FROM unnest(coalesce(c."searchAliases", '{}')) alias WHERE alias ILIKE ('%' || :searchString || '%')) THEN 2.5 ELSE 0 END +
              CASE WHEN EXISTS (SELECT 1 FROM unnest(coalesce(p."searchAliases", '{}')) alias WHERE alias ILIKE ('%' || :searchString || '%')) THEN 2 ELSE 0 END +
              CASE WHEN EXISTS (SELECT 1 FROM unnest(coalesce(p."searchRelatedTerms", '{}')) term WHERE term ILIKE ('%' || :searchString || '%')) THEN 1.2 ELSE 0 END +
              CASE WHEN EXISTS (SELECT 1 FROM unnest(coalesce(p."searchUseCases", '{}')) use_case WHERE use_case ILIKE ('%' || :searchString || '%')) THEN 1 ELSE 0 END +
              CASE WHEN p.description ILIKE ('%' || :searchString || '%') THEN 0.8 ELSE 0 END +
              ts_rank(coalesce(p."searchDocumentTsvector", p."textSearch"), websearch_to_tsquery('swedish', :searchString), 0) +
              word_similarity(lower(:searchString), lower(p.title)) +
              (similarity(lower(coalesce(p."searchDocument", '')), lower(:searchString)) * 0.5)
            ) as resultrank
          FROM product p
          LEFT JOIN category c ON c.id = p."categoryId"
          LEFT JOIN category parent ON parent.id = c."parentId"
          LEFT JOIN brand b ON b.id = p."brandId"
          WHERE coalesce(p."searchDocumentTsvector", p."textSearch") @@ websearch_to_tsquery('swedish', :searchString)
            OR p.title ILIKE ('%' || :searchString || '%')
            OR p.description ILIKE ('%' || :searchString || '%')
            OR b.name ILIKE ('%' || :searchString || '%')
            OR c.name ILIKE ('%' || :searchString || '%')
            OR parent.name ILIKE ('%' || :searchString || '%')
            OR EXISTS (SELECT 1 FROM unnest(coalesce(c."searchAliases", '{}')) alias WHERE alias ILIKE ('%' || :searchString || '%'))
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchAliases", '{}')) alias WHERE alias ILIKE ('%' || :searchString || '%'))
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchRelatedTerms", '{}')) term WHERE term ILIKE ('%' || :searchString || '%'))
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchUseCases", '{}')) use_case WHERE use_case ILIKE ('%' || :searchString || '%'))
            OR word_similarity(lower(:searchString), lower(p.title)) >= 0.55
            OR word_similarity(lower(:searchString), lower(coalesce(p."searchDocument", ''))) >= 0.45
          `,
        'ranked_products',
      )
        .setParameter('searchString', input.searchString)
        .innerJoin('ranked_products', 'rp', `rp.id = ${productAlias}.id`)
        .andWhere('rp.resultrank > :searchRankThreshold', {
          searchRankThreshold:
            options.searchRankThreshold ?? PRODUCT_SEARCH_RANK_THRESHOLD,
        })
        .addSelect('rp.resultrank', 'resultrank');
    }

    //Transportation
    if (!options.ignoreTransportation) {
      qb.andWhere(`
        (${input.pickup === false ? 'FALSE' : `${productAlias}."pickupEnabled" = TRUE`}
          OR ${input.shipping === false ? 'FALSE' : `EXISTS (SELECT 1 from product_shipping_prices_shipping_price WHERE "productId" = ${productAlias}.id)`}
          OR ${input.delivery === false ? 'FALSE' : `${productAlias}."deliveryEnabled" = TRUE`})`);
    }

    //Include products based on category criterias
    if (
      input.categoryIds ||
      input.selectionCategories ||
      input.seasonalCategories
    ) {
      qb.innerJoin('category', 'c', `${productAlias}."categoryId" = c.id`);

      if (input.categoryIds?.length) {
        qb.andWhere(
          '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
          {
            categoryIds: input.categoryIds,
          },
        );
      } else if (input.selectionCategories) {
        qb.leftJoin('category', 'parent', 'parent.id = c."parentId"');
        qb.andWhere('(c."inSelection" OR parent."inSelection")');
      } else {
        qb.leftJoin('category', 'parent', 'parent.id = c."parentId"');
        qb.andWhere('(c."inSeason" OR parent."inSeason")');
      }
    }

    if (input.brandIds) {
      if (!input.brandIds.length) {
        qb.andWhere(`${productAlias}."brandId" IS NULL`);
      }
      if (input.brandIds.length) {
        qb.andWhere(`${productAlias}."brandId" IN (:...brandIds)`, {
          brandIds: input.brandIds,
        });
      }
    }

    if (input.conditions) {
      if (!input.conditions.length) {
        qb.andWhere(`${productAlias}.condition IS NULL`);
      }
      if (input.conditions.length) {
        qb.andWhere(`${productAlias}.condition IN (:...conditions)`, {
          conditions: input.conditions,
        });
      }
    }

    //Prices
    if (input.giveaway) {
      qb.andWhere(`${productAlias}."isGiveaway" = TRUE`);
    } else {
      if (input.minPrice !== undefined) {
        qb.andWhere(`${productAlias}.price / 100 >= :minPrice`, {
          minPrice: input.minPrice,
        });
      }
      if (input.maxPrice !== undefined) {
        qb.andWhere(`${productAlias}.price / 100 <= :maxPrice`, {
          maxPrice: input.maxPrice,
        });
      }
    }

    if (input.likedByUserIds) {
      qb.innerJoin(
        'product_liked_by_user',
        'plbu',
        `plbu.productId = ${productAlias}.id`,
      );
      qb.andWhere('plbu.userId IN (:...likedByUserIds)', {
        likedByUserIds: input.likedByUserIds,
      });
    }
    return qb;
  }

  async findAll(
    input: ProductsInput,
    _limit?: number,
    offset?: number,
    currentUserId?: string,
    options: FindProductsQueryOptions = {},
  ) {
    const query = this.productRepository.createQueryBuilder('p');

    //Only admin will see hidden products
    if (currentUserId) {
      const user = await this.userRepository.findOneBy({ id: currentUserId });
      if (!user) {
        throw BadUserInputException('Invalid user');
      }
    }

    this.basicFindProductsInputQueryBuilder(input, query, 'p', options);

    //If address or location are included, use them to calculate
    //an origin point for filtering and ordering
    let origin: Point;
    if (input.address) {
      const location = await this.geocodingService.addressToLocation(
        input.address,
      );
      origin = {
        type: 'Point',
        coordinates: [location.lat, location.lng],
      };
    }
    if (input.location) {
      origin = {
        type: 'Point',
        coordinates: [input.location.lat, input.location.lng],
      };
    }
    if (origin !== undefined) {
      //If distance is included, only select products whose distance to origin is less than input.distance
      if (input.distance) {
        //convert from km to meters
        const distance = input.distance;

        //If product has a project, use the project's address
        const product_address_location = `
        case
          WHEN p."projectId" IS NOT NULL then (select "addressLocation" from project pj where pj.id = p."projectId")
          ELSE p."addressLocation"
        END
        `;

        query.andWhere(
          `(
            (${product_address_location} IS NOT NULL AND st_distancesphere(${product_address_location}, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(${product_address_location}))) <= :distance)
            OR (p.visibility = '${ProductVisibility.INTERNAL}' AND p."publiclyAvailable" = true)
          )`,
          { origin, distance },
        );
      }
      query.addSelect(
        'st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID("addressLocation")))',
        'distance_from_position',
      );

      query.setParameter('origin', origin);
    }

    if (input.excludeOwnProducts && currentUserId) {
      query.andWhere('p.sellerId != :currentUserId', { currentUserId });
    }
    query.addOrderBy('p."status"');
    switch (input.orderBy) {
      case OrderProductsEnum.BEST_MATCH:
        if (input.searchString && input.searchString.length > 0) {
          query
            .addOrderBy('resultrank', 'DESC')
            .addOrderBy('p.publishedAt', 'DESC');
        } else {
          query.addOrderBy('p.publishedAt', 'DESC');
        }
        break;
      case OrderProductsEnum.OLDEST:
        query.addOrderBy('p.publishedAt', 'ASC');
        break;
      case OrderProductsEnum.LATEST:
        query.addOrderBy('p.publishedAt', 'DESC');
        break;
      case OrderProductsEnum.PRICE_ASC:
        query.addOrderBy('p.price', 'ASC');
        break;
      case OrderProductsEnum.PRICE_DESC:
        query.addOrderBy('p.price', 'DESC');
        break;
      case OrderProductsEnum.DISTANCE:
        if (
          input.orderBy === OrderProductsEnum.DISTANCE &&
          origin !== undefined
        ) {
          query.addOrderBy(
            'st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID("addressLocation")))',
          );
        }
        break;
      default:
        query.addOrderBy('p.publishedAt', 'DESC');
    }

    //limit defaults to 20 and may not exceed 40
    const limit = _limit ?? 20;
    query.limit(limit > 40 ? 40 : limit);
    query.offset((offset ?? 0) * limit);

    const result = await query.getManyAndCount();

    //Create search result if this search yielded any result
    if (result[1] && input.searchString && currentUserId) {
      this.searchResultService.createSearchResult(
        {
          searchString: input.searchString,
        },
        currentUserId,
      );
    }

    return {
      products: result[0],
      origin: origin
        ? { lat: origin.coordinates[0], lng: origin.coordinates[1] }
        : null,
      total: result[1],
    };
  }

  async relatedProducts(
    input: ProductsInput,
    excludeProductIds: string[],
    _limit?: number,
    offset?: number,
    currentUserId?: string,
  ) {
    const relaxedInput: ProductsInput = {
      ...input,
      orderBy: OrderProductsEnum.BEST_MATCH,
      distance: undefined,
      location: undefined,
      pickup: undefined,
      shipping: undefined,
      delivery: undefined,
    };

    return this.findAll(relaxedInput, _limit, offset, currentUserId, {
      excludeProductIds,
      ignoreTransportation: true,
      searchRankThreshold: RELATED_PRODUCT_SEARCH_RANK_THRESHOLD,
    });
  }

  async findOne(id: string, currentUserId: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { conversations: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    if (product.status === ProductStatus.DELETED) {
      const currentUserHasConnection =
        product.conversations.some((c) => c.buyerId === currentUserId) ||
        product.sellerId === currentUserId;

      if (!currentUserHasConnection) {
        throw BadUserInputException();
      }
    }
    // Even an authorized organization member must use the internal-ad query.
    // This prevents private ads from rendering on ordinary product routes.
    this.assertMarketplaceProduct(product);

    return product;
  }

  assertMarketplaceProduct(product: Product) {
    if (
      product.visibility === ProductVisibility.INTERNAL &&
      !product.publiclyAvailable
    ) {
      throw NotFoundException('Product not found');
    }
  }

  private async canManageInternalProduct(product: Product, userId: string) {
    if (
      product.createdByUserId === userId ||
      product.internalOrganizationId === userId
    ) {
      return true;
    }
    const result = await this.dataSource.query(
      `SELECT 1 FROM organization_membership WHERE "organizationId" = $1 AND "userId" = $2 AND role = $3 LIMIT 1`,
      [product.internalOrganizationId, userId, OrganizationMemberRole.ADMIN],
    );
    return result.length > 0;
  }

  async isLikedBy(productId: string, userId?: string) {
    if (!userId) {
      return null;
    }

    const likedProductExists = await this.productRepository.exists({
      where: { id: productId, likedBy: { id: userId } },
    });

    return likedProductExists;
  }

  async setLikeProduct(productId: string, like: boolean, userId: string) {
    const [product, user] = await Promise.all([
      await this.productRepository.findOne({
        where: { id: productId },
        relations: { likedBy: true },
      }),
      await this.userRepository.findOneBy({ id: userId }),
    ]);

    if (!product || !user) {
      throw BadUserInputException();
    }
    this.assertMarketplaceProduct(product);

    //If trying to like and not already liking, add user
    if (
      like &&
      !product.likedBy.some((likedByUser) => likedByUser.id === userId)
    ) {
      product.likedBy.push(user);
    }

    //If removing like, remove the user from the like array
    if (!like) {
      product.likedBy = product.likedBy.filter(
        (likedByUser) => likedByUser.id !== userId,
      );
    }

    return await this.productRepository.save(product);
  }

  /**
   *
   * Soft deletes a product
   */
  async removeProduct(productId: string, currentUserId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        images: true,
        documents: true,
      },
    });
    if (!product) {
      throw BadUserInputException();
    }
    const canManageInternalProduct =
      product.visibility === ProductVisibility.INTERNAL &&
      (await this.canManageInternalProduct(product, currentUserId));
    if (product.sellerId !== currentUserId && !canManageInternalProduct) {
      throw ForbiddenException();
    }
    const canDelete = this.canDelete(product);
    if (!canDelete) {
      throw ForbiddenException('Product got ongoing purchase');
    }

    product.deletedAt = new Date();
    product.status = ProductStatus.DELETED;
    await this.fileService.deleteFiles(product.images);
    product.images = [];
    await this.fileService.deleteFiles(product.documents);
    product.documents = [];
    product.likedBy = [];

    return await this.productRepository.save(product);
  }

  async deleteDraft(productId: string, currentUserId: string) {
    const draft = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!draft) {
      throw BadUserInputException();
    }
    if (
      draft.status !== ProductStatus.DRAFT ||
      draft.visibility !== ProductVisibility.PUBLIC
    ) {
      throw BadUserInputException('Product is not a public draft');
    }
    if (draft.sellerId !== currentUserId) {
      throw ForbiddenException();
    }

    await this.delete(productId);
    return true;
  }

  async address(product: Product) {
    if (product.projectId) {
      const project = await this.projectService.findOne({
        id: product.projectId,
      });
      if (!project) {
        throw InternalServerException('No project found');
      }
      return project.address;
    }
    return product.address;
  }
  async location(product: Product) {
    if (product.projectId) {
      const project = await this.projectService.findOne({
        id: product.projectId,
      });
      if (!project) {
        throw InternalServerException('No project found');
      }
      return {
        lat: project.addressLocation.coordinates[0],
        lng: project.addressLocation.coordinates[1],
      };
    }
    if (!product.addressLocation) {
      return null;
    }
    return {
      lat: product.addressLocation.coordinates[0],
      lng: product.addressLocation.coordinates[1],
    };
  }

  async canDelete(product: Product) {
    //Can not delete any product with an ongoing purchase
    const existingPurchases = await this.purchaseRepository.find({
      where: {
        productId: product.id,
        status: Not(PurchaseStatusEnum.FINISHED_FAILED) || Not(IsNull()),
      },
    });

    if (existingPurchases.length) {
      return false;
    }
    return true;
  }

  /**
   * Deletes products. Note: does NOT soft delete them but instead remove them and all depending database
   * entries from the database
   */
  async deleteMany(products: Product[]) {
    return await Promise.all(
      products.map((product) => this.delete(product.id)),
    );
  }
  async delete(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        images: true,
        conversations: true,
        purchases: true,
        documents: true,
      },
    });
    if (!product) {
      throw BadUserInputException();
    }

    await this.fileService.deleteFiles([
      ...product.images,
      ...product.documents,
    ]);
    await this.conversationService.deleteMany(product.conversations);
    await this.purchaseService.deleteMany(product.purchases);
    return await this.productRepository.remove(product);
  }

  async getShippingOptions(input: GetTransportationOptionsInput) {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { shippingPrices: true },
    });
    if (!product || !input.postCode) {
      throw BadUserInputException();
    }
    this.assertMarketplaceProduct(product);

    return await Promise.all(
      product.shippingPrices.map(async (_shippingPrice) => {
        const servicePoints =
          await this.shippingService.findNearbyServicePoints(
            input.postCode,
            _shippingPrice.provider,
            4,
          );
        let shippingPrice = _shippingPrice;
        if (input.quantity) {
          const shippingWeightForQuantity =
            _shippingPrice.maxWeight * (input.quantity ?? 1);
          shippingPrice =
            await this.shippingPriceService.shippingPriceMatchingWeight(
              shippingWeightForQuantity,
            );
        }
        return {
          shippingPrice,
          servicePoints,
        };
      }),
    );
  }
  async getDeliveryOptions(input: GetTransportationOptionsInput) {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { project: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    this.assertMarketplaceProduct(product);

    if (!product.deliveryEnabled) {
      return null;
    }

    const geocodePromise = input.address
      ? this.geocodingService.geocode(input.address)
      : this.geocodingService.geocode(undefined, {
          postal_code: input.postCode,
        });
    const geocode = await geocodePromise;
    const location = geocode.location;
    const locationPoint: Point = {
      type: 'Point',
      coordinates: [location.lat, location.lng],
    };

    const distance = product.project
      ? await this.projectService.distanceToProject(
          locationPoint,
          product.project.id,
        )
      : await this.distanceToProduct(locationPoint, product.id);
    const isWithinRadius = distance < product.deliveryRadius;

    return {
      deliverToLocation: location,
      isWithinRadius,
      distanceFromProduct: Math.round(distance),
      deliveryPrice: product.deliveryPrice / 100,
      postalCode: geocode.postalCode,
    };
  }

  async distanceToProduct(locationPoint: Point, productId: string) {
    const result = await this.dataSource.query(
      'SELECT st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON($1), ST_SRID("addressLocation"))) as "distance" from product p WHERE p.id = $2',
      [locationPoint, productId],
    );
    return result[0].distance;
  }

  async recommendedProducts(
    userId: string,
    input: RecommendedProductsInput,
    limit?: number,
    offset?: number,
  ): Promise<Product[]> {
    switch (input.recommendationSource) {
      case ProductsRecommendationSourceEnum.LIKES: {
        const query = this.productRepository.createQueryBuilder('p');
        query.innerJoin('category', 'c', '"categoryId" = c.id');

        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: { likedProducts: true },
        });

        const categoryIds = user.likedProducts.map(
          (product) => product.categoryId,
        );

        if (!categoryIds.length) {
          return [];
        }

        query.andWhere(`p."hiddenReason" IS NULL`);
        query.andWhere(`(p.status = 'PUBLISHED' OR p.status = 'SOLD')`);
        query.andWhere('p.visibility = :visibility', {
          visibility: ProductVisibility.PUBLIC,
        });
        query.andWhere(
          '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
          { categoryIds },
        );

        if (input.excludeOwnProducts) {
          query.andWhere('p.sellerId != :userId', { userId });
        }

        query.andWhere(
          `NOT EXISTS (
            SELECT 1
            FROM product_liked_by_user plbu
            WHERE plbu."productId" = p.id
            AND plbu."userId" = :userId
            )`,
          { userId },
        );

        query.addOrderBy('p.publishedAt', 'DESC');

        const safeLimit = limit && limit > 0 ? Math.min(limit, 40) : 10;
        query.limit(safeLimit);
        query.offset((offset ?? 0) * safeLimit);

        return await query.getMany();
      }

      case ProductsRecommendationSourceEnum.SEARCH_HISTORY: {
        const search = await this.searchResultService.getLatestSearch(userId);
        const searchString = search.searchString;

        const result = await this.findAll(
          { searchString, excludeOwnProducts: input.excludeOwnProducts },
          limit ?? 10,
          offset ?? 0,
          userId,
        );

        return result.products;
      }
      default:
        return [];
    }
  }
  async similarProducts(
    similarToProductId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedProductsResponse> {
    const query = this.productRepository
      .createQueryBuilder('p')
      .innerJoin(
        'category',
        'c',
        `c.id = p."categoryId" AND c."parentId" IN (
          SELECT pc.id from product p
            INNER JOIN category c ON c.id = p."categoryId"
            INNER join category pc on pc.id = c."parentId"
            WHERE p.id = :similarToProductId)`,
        { similarToProductId },
      )
      .where('p.id != :similarToProductId', { similarToProductId })
      .andWhere(`p.status = '${ProductStatus.PUBLISHED}'`)
      .andWhere('p.visibility = :visibility', {
        visibility: ProductVisibility.PUBLIC,
      })
      .andWhere('p."hiddenReason" IS NULL');
    query.addOrderBy('p.publishedAt', 'DESC');

    const safeLimit = limit && limit > 0 ? Math.min(limit, 40) : 10;
    query.limit(safeLimit);
    query.offset((offset ?? 0) * safeLimit);
    const result = await query.getManyAndCount();

    return {
      products: result[0],
      total: result[1],
    };
  }

  async cmsGetProduct(productId: string) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw BadUserInputException();
    return product;
  }

  async cmsListProducts(
    input: CmsListProductsInput,
  ): Promise<CmsListProductsResponse> {
    const { pageSize = 10, page = 0, searchString = '' } = input;
    const skip = Math.max(0, pageSize * page);

    const [products, total] = await this.productRepository.findAndCount({
      where: [
        {
          status: Not(ProductStatus.DRAFT),
          visibility: ProductVisibility.PUBLIC,
          title: ILike(`%${searchString}%`),
        },
        {
          status: Not(ProductStatus.DRAFT),
          visibility: ProductVisibility.PUBLIC,
          seller: {
            username: ILike(`%${searchString}%`),
          },
        },
        {
          status: Not(ProductStatus.DRAFT),
          visibility: ProductVisibility.PUBLIC,
          seller: {
            email: ILike(`%${searchString}%`),
          },
        },
        {
          status: Not(ProductStatus.DRAFT),
          visibility: ProductVisibility.PUBLIC,
          category: {
            name: ILike(`%${searchString}%`),
          },
        },
      ],
      take: pageSize,
      skip,
      order: { updatedAt: 'DESC' },
      relations: {
        seller: true,
        category: true,
      },
    });

    return {
      products,
      total,
    };
  }

  async cmsCreateProduct(
    input: CmsCreateProductInput,
    sellerId: string,
  ): Promise<CmsCreateProductResponse> {
    try {
      const {
        measurement,
        images,
        documents,
        price,
        deliveryRadius,
        deliveryPrice,
        shippingPriceIds,
        ...rest
      } = input;

      const seller = await this.userRepository.findOne({
        where: { id: sellerId },
      });
      if (!seller) {
        throw BadUserInputException('Seller not found');
      }

      const sellerAccountEnabled =
        await this.userService.sellerAccountIsEnabled(seller);
      if (!sellerAccountEnabled) {
        throw BadUserInputException('Seller has not completed onboarding');
      }

      const location = await this.geocodingService.addressToLocation(
        input.address,
      );

      const shippingPrices = await this.shippingPriceRepository.find({
        where: { id: In(shippingPriceIds) },
      });

      const product = this.productRepository.create({
        sellerId,
        status: ProductStatus.PUBLISHED,
        price: price * 100,
        images: await this.fileService.createFiles(images),
        documents: await this.fileService.createFiles(documents),
        addressLocation: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
        deliveryRadius: deliveryRadius ? deliveryRadius * 1000 : undefined,
        deliveryPrice: deliveryPrice ? deliveryPrice * 100 : undefined,
        shippingPrices: shippingPrices,
        ...rest,
        ...measurement,
      });

      await this.enrichProductSearchMetadata(product, {
        searchAliases: input.searchAliases,
        searchRelatedTerms: input.searchRelatedTerms,
        searchUseCases: input.searchUseCases,
      });

      return {
        product: await this.productRepository.save(product),
        imagePutUrls: await this.fileService.uploadFiles(product.images, true),
        documentPutUrls: await this.fileService.uploadFiles(
          product.documents,
          true,
        ),
      };
    } catch (error) {
      throw BadUserInputException('Failed to create product' + error);
    }
  }

  async cmsUpdateProduct(
    input: CmsUpdateProductInput,
  ): Promise<CmsUpdateProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id: input.id },
      relations: { images: true, documents: true },
    });

    if (!product) throw NotFoundException('Product not found');

    try {
      const {
        measurement,
        removeImages,
        addImages,
        removeDocuments,
        addDocuments,
        price,
        deliveryRadius,
        deliveryPrice,
        shippingPriceIds,
        ...rest
      } = input;

      const location = await this.geocodingService.addressToLocation(
        input.address,
      );
      const shippingPrices = await this.shippingPriceRepository.find({
        where: { id: In(shippingPriceIds) },
      });

      const removeImageIds = new Set(removeImages);
      const removeDocumentIds = new Set(removeDocuments);

      const keepImageList = product.images.filter(
        (img) => !removeImageIds.has(img.id),
      );
      const removeImageList = product.images.filter((img) =>
        removeImageIds.has(img.id),
      );

      const keepDocumentList = product.documents.filter(
        (doc) => !removeDocumentIds.has(doc.id),
      );
      const removeDocumentList = product.documents.filter((doc) =>
        removeDocumentIds.has(doc.id),
      );

      await this.fileService.deleteFiles([
        ...removeImageList,
        ...removeDocumentList,
      ]);

      const addImageList = await this.fileService.createFiles(addImages);
      const addDocumentList = await this.fileService.createFiles(addDocuments);

      Object.assign<Product, Partial<Product>>(product, {
        addressLocation: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
        price: price * 100,
        images: [...keepImageList, ...addImageList],
        documents: [...keepDocumentList, ...addDocumentList],
        deliveryRadius: deliveryRadius ? deliveryRadius * 1000 : undefined,
        deliveryPrice: deliveryPrice ? deliveryPrice * 100 : undefined,
        shippingPrices: shippingPrices,
        ...rest,
        ...measurement,
      });

      await this.enrichProductSearchMetadata(product, {
        searchAliases: input.searchAliases,
        searchRelatedTerms: input.searchRelatedTerms,
        searchUseCases: input.searchUseCases,
      });

      return {
        product: await this.productRepository.save(product),
        imagePutUrls: await this.fileService.uploadFiles(product.images, true),
        documentPutUrls: await this.fileService.uploadFiles(
          product.documents,
          true,
        ),
      };
    } catch (error) {
      throw BadUserInputException(`Failed to update product: ${error}`);
    }
  }

  /**
   * Hide listings whose optional end date (availableUntil) has passed. Only
   * touches still-visible published ads, so it's idempotent: once hiddenReason
   * is set the row no longer matches and won't be processed again.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async hideExpiredListings(): Promise<void> {
    const logger = this.logger.child({
      cron: 'hideExpiredListings',
      requestId: crypto.randomUUID(),
    });
    const now = dayjs().toDate();
    const expired = await this.productRepository.find({
      where: {
        availableUntil: LessThanOrEqual(now),
        hiddenReason: IsNull(),
        status: ProductStatus.PUBLISHED,
      },
    });
    if (!expired.length) return;

    logger.info('Hiding expired listings', { count: expired.length });
    await this.productRepository.update(
      { id: In(expired.map((p) => p.id)) },
      { hiddenReason: AD_EXPIRED_HIDDEN_REASON },
    );
  }

  /**
   * Flip "snart till salu" (UPCOMING) listings to AVAILABLE once their start
   * date has passed, so the seller doesn't have to mark them manually. Rows
   * without a date (estimatedAvailableAt null) never match, so they stay
   * UPCOMING until the seller acts. Idempotent: once AVAILABLE the row no
   * longer matches. Mirrors the manual markAvailable (clears date/precision,
   * keeps availableUntil so the expiry job still applies).
   */
  @Cron(CronExpression.EVERY_HOUR)
  async activateDueUpcomingListings(): Promise<void> {
    const logger = this.logger.child({
      cron: 'activateDueUpcomingListings',
      requestId: crypto.randomUUID(),
    });
    const now = dayjs().toDate();
    const due = await this.productRepository.find({
      where: {
        availability: ProductAvailabilityEnum.UPCOMING,
        estimatedAvailableAt: LessThanOrEqual(now),
      },
    });
    if (!due.length) return;

    logger.info('Activating due upcoming listings', { count: due.length });
    await this.productRepository.update(
      { id: In(due.map((p) => p.id)) },
      {
        availability: ProductAvailabilityEnum.AVAILABLE,
        estimatedAvailableAt: null,
        availabilityPrecision: null,
      },
    );
  }

  async cmsHideProduct(productId: string, hiddenReason: string) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw NotFoundException('Product not found');

    try {
      product.hiddenReason = hiddenReason;
      return await this.productRepository.save(product);
    } catch (error) {
      throw BadUserInputException(`Failed to hide product: ${error}`);
    }
  }

  async cmsUnhideProduct(productId: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw NotFoundException('Product not found');

    try {
      product.hiddenReason = null;
      return await this.productRepository.save(product);
    } catch (error) {
      throw BadUserInputException(`Failed to unhide product: ${error}`);
    }
  }

  async cmsDeleteProduct(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { images: true, documents: true },
    });

    if (!product) throw NotFoundException('Product not found');

    const canDelete = this.canDelete(product);
    if (!canDelete) throw ForbiddenException('Product got ongoing purchase');

    try {
      await Promise.all([
        this.fileService.deleteFiles(product.images),
        this.fileService.deleteFiles(product.documents),
      ]);

      Object.assign<Product, Partial<Product>>(product, {
        deletedAt: new Date(),
        status: ProductStatus.DELETED,
        images: [],
        documents: [],
        likedBy: [],
      });

      return await this.productRepository.save(product);
    } catch (error) {
      throw BadUserInputException(`Failed to delete product: ${error}`);
    }
  }

  private async enrichProductSearchMetadata(
    product: Product,
    input?: {
      searchAliases?: string[] | null;
      searchRelatedTerms?: string[] | null;
      searchUseCases?: string[] | null;
    },
  ) {
    const categoryId = product.categoryId ?? product.category?.id;
    const category = product.category?.parent
      ? product.category
      : categoryId
        ? await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: { parent: true },
          })
        : null;
    const brand = product.brandId
      ? await this.brandRepository.findOne({ where: { id: product.brandId } })
      : null;

    const providedAliases = input?.searchAliases;
    const providedRelatedTerms = input?.searchRelatedTerms;
    const providedUseCases = input?.searchUseCases;
    const hasExistingSearchTerms = Boolean(
      product.searchAliases?.length ||
        product.searchRelatedTerms?.length ||
        product.searchUseCases?.length,
    );
    const hasProvidedSearchTerms =
      Boolean(
        providedAliases?.length ||
          providedRelatedTerms?.length ||
          providedUseCases?.length,
      ) ||
      (hasExistingSearchTerms &&
        (providedAliases !== undefined ||
          providedRelatedTerms !== undefined ||
          providedUseCases !== undefined));

    const generated = hasProvidedSearchTerms
      ? null
      : await this.searchEnrichmentService.generateProductSearchEnrichment({
          title: product.title,
          description: product.description,
          categoryName: category?.name,
          parentCategoryName: category?.parent?.name,
          categorySearchAliases: category?.searchAliases,
          brandName: brand?.name,
        });

    product.searchAliases = this.searchEnrichmentService.sanitizeTerms(
      providedAliases ??
        generated?.searchAliases ??
        product.searchAliases ??
        [],
    );
    product.searchRelatedTerms = this.searchEnrichmentService.sanitizeTerms(
      providedRelatedTerms ??
        generated?.searchRelatedTerms ??
        product.searchRelatedTerms ??
        [],
    );
    product.searchUseCases = this.searchEnrichmentService.sanitizeTerms(
      providedUseCases ??
        generated?.searchUseCases ??
        product.searchUseCases ??
        [],
    );
    product.searchDocument =
      this.searchEnrichmentService.buildProductSearchDocument({
        title: product.title,
        description: product.description,
        categoryName: category?.name,
        parentCategoryName: category?.parent?.name,
        categorySearchAliases: category?.searchAliases,
        brandName: brand?.name,
        searchAliases: product.searchAliases,
        searchRelatedTerms: product.searchRelatedTerms,
        searchUseCases: product.searchUseCases,
      });
  }
}
