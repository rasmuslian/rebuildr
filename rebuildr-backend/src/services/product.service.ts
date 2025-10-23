import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Category } from 'src/entities/category.entity';
import {
  Product,
  ProductConditionEnum,
  ProductStatus,
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
  CreateProductResponse,
  FileInputType,
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
  Not,
  Point,
  Repository,
  ILike,
} from 'typeorm';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';
import { MessageService } from './message.service';
import { PurchaseService } from './purchase.service';
import { QuantityUnitEnum } from 'src/entities/enums';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { Logger } from 'winston';
import * as z from 'zod';
import { maximumEscrow, minimumEscrow } from 'src/constants/pricing';
import { File } from '../entities/file.entity';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { ShippingService } from './shipping.service';
import {
  ProductsRecommendationSourceEnum,
  RecommendedProductsInput,
} from 'src/resolvers/user.resolver';
import { SearchResultService } from './search-result.service';
import { ProjectService } from './project.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private fileService: FileService,
    private caslAbilityFactory: CaslAbilityFactory,
    private messageService: MessageService,
    private purchaseService: PurchaseService,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(ShippingPrice)
    private shippingPriceRepository: Repository<ShippingPrice>,
    private shippingService: ShippingService,
    private searchResultService: SearchResultService,
    private dataSource: DataSource,
    private projectService: ProjectService,
  ) {}

  async create(input: {
    title: string;
    categoryId: string;
    userId: string;
    price: number;
    address: string;
    images?: FileInputType[];
    isGiveaway?: boolean;
    brand?: string;
    amount?: number;
    height?: number;
    width?: number;
    depth?: number;
    volume?: number;
    condition: ProductConditionEnum;
    description?: string;
  }): Promise<CreateProductResponse> {
    const product = new Product();

    const category = await this.categoryRepository.findOneBy({
      id: input.categoryId,
    });
    if (!category) {
      throw BadUserInputException('Invalid input');
    }

    const user = await this.userRepository.findOneBy({ id: input.userId });
    if (!user) {
      throw BadUserInputException('Invalid input');
    }

    product.title = input.title;
    product.category = category;
    product.seller = user;
    product.price = input.price; //TODO: minimum price?
    product.address = input.address;
    product.isGiveaway = input.isGiveaway;
    product.primaryQuantity = input.amount;
    product.primaryUnit = QuantityUnitEnum.AMOUNT;
    product.height = input.height;
    product.width = input.width;
    product.thickness = input.depth;
    product.condition = input.condition;
    product.description = input.description;
    const location = await this.geocodingService.addressToLocation(
      input.address,
    );
    product.addressLocation = {
      type: 'Point',
      coordinates: [location.lat, location.lng],
    };
    const images = await Promise.all(
      input.images?.map((image) => {
        return this.fileService.createFile({ mimeType: image.mimeType });
      }) ?? [],
    );

    product.images = images;
    const createdProduct = await this.productRepository.save(product);

    return {
      product: createdProduct,
      presignedPutUrls: await this.fileService.uploadFiles(images, true),
    };
  }

  async getDraft(currentUserId: string) {
    return await this.productRepository.findOne({
      where: {
        sellerId: currentUserId,
        status: ProductStatus.DRAFT,
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
      },
    });

    //delete all existing drafts
    await this.deleteMany(existingDrafts);

    const product = new Product();
    product.title = '';
    product.price = 0;
    product.status = ProductStatus.DRAFT;
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

  //A user must be admin or own the product to edit them
  // and the product can not have ongoing purchases on them
  async canEdit(product: Product, userId: string, userRole: UserRoleEnum) {
    if (userRole !== UserRoleEnum.ADMIN && userId !== product.sellerId) {
      return false;
    }

    const purchases = await this.purchaseRepository.find({
      where: {
        productId: product.id,
        status: Not(PurchaseStatusEnum.FINISHED_FAILED),
      },
    });
    if (purchases.length) {
      return false;
    }

    return true;
  }

  async updateProduct(
    input: UpdateProductInput,
    currentUserId: string,
    currentUserRole: UserRoleEnum,
    logger: Logger,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: input.id, purchases: null },
      relations: {
        images: true,
        documents: true,
      },
    });

    const canEdit = await this.canEdit(product, currentUserId, currentUserRole);

    if (!canEdit) {
      logger.error('User does not have permission to update product');

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
      if (convertedPrice < minimumEscrow) {
        errors.push({
          message: `Priset måste vara 0 kr (bortskänkes) eller minst ${Math.round(minimumEscrow / 100)} kr`,
          name: 'price',
        });
      }
      if (convertedPrice > maximumEscrow) {
        errors.push({
          message: `Priset måste vara lägre än ${Math.round(maximumEscrow / 100)} kr`,
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
    if (convertedPrice !== undefined) {
      product.price = convertedPrice;
      product.isGiveaway = convertedPrice <= 0;
    }
    if (input.status) {
      product.status = input.status;
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
      const category = await this.categoryRepository.findOne({
        where: { id: Equal(input.categoryId) },
      });
      product.categoryId = category.id;
    }
    //null means removing the project
    if (!!input.projectId || input.projectId === null) {
      product.noProject = !input.projectId;
      product.projectId = input.projectId;
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

    //Transportations
    if (input.location) {
      product.address = (
        await this.geocodingService.locationToAddress(input.location)
      ).address;
      product.addressLocation = {
        type: 'Point',
        coordinates: [input.location.lat, input.location.lng],
      };
      //Remove connection to project when new address is added to product
      product.project = null;
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

    //By this point we can validate the product, but only if it is to be published
    if (product.status === ProductStatus.PUBLISHED) {
      const parseResult = z
        .object({
          title: z.string().min(1),
          description: z.string().min(1),
          categoryId: z.string().min(1),
        })
        .safeParse(product);
      if (!parseResult.success) {
        logger.error({
          message: 'Invalid update of product',
          errors: parseResult.error.errors,
        });

        throw BadUserInputException('Invalid update of product');
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

      if (!product.isGiveaway && product.price < minimumEscrow) {
        logger.error({
          message: 'Too low price',
          price: product.price,
          minimumEscrow,
        });

        throw BadUserInputException('Too low price');
      }
      if (!product.isGiveaway && product.price > maximumEscrow) {
        logger.error({
          message: 'Too high price',
          price: product.price,
          maximumEscrow,
        });

        throw BadUserInputException('Too high price');
      }

      if (!product.primaryQuantity || !product.primaryUnit) {
        throw BadUserInputException('Product must specify quantity');
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

    return {
      product: await this.productRepository.save(product),
      imagePutUrls: this.fileService.uploadFiles(product.images, true),
      documentPutUrls: this.fileService.uploadFiles(product.documents, true),
    };
  }

  async findAll(
    input: ProductsInput,
    _limit?: number,
    offset?: number,
    userId?: string,
  ) {
    const query = this.productRepository.createQueryBuilder('p');

    //Only admin will see hidden products
    if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw BadUserInputException('Invalid user');
      }
      if (user.role !== UserRoleEnum.ADMIN) {
        query.andWhere('"hiddenReason" IS NULL');
      }
    } else {
      query.andWhere('"hiddenReason" IS NULL');
    }

    query.andWhere(`(status = 'PUBLISHED' OR status = 'SOLD')`);

    if (input.sellerId) {
      query.andWhere('"sellerId" = :sellerId', { sellerId: input.sellerId });
    }

    if (input.searchString) {
      query
        .addCommonTableExpression(
          `SELECT 
            p.id,
            ts_rank(p."textSearch", plainto_tsquery(:searchString), 0) + similarity(p.title, :searchString) as resultrank
          FROM product p
          WHERE p."textSearch" @@ plainto_tsquery(:searchString) 
            OR similarity(p.title, :searchString) > 0
          `,
          'ranked_products',
        )
        .setParameter('searchString', input.searchString)
        .innerJoin('ranked_products', 'rp', 'rp.id = p.id')
        .andWhere(
          `(rp.resultrank > 0.25 OR p.title ILIKE '${input.searchString}%' )`,
        )
        .addSelect('rp.resultrank', 'resultrank');
    }

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
          `st_distancesphere(${product_address_location}, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(${product_address_location}))) <= :distance`,
          { origin, distance },
        );
      }
      query.addSelect(
        'st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID("addressLocation")))',
        'distance_from_position',
      );

      query.setParameter('origin', origin);
    }

    //Transportation
    query.andWhere(`
      (${input.pickup === false ? 'FALSE' : 'p."pickupEnabled" = TRUE'} 
        OR ${input.shipping === false ? 'FALSE' : 'EXISTS (SELECT 1 from product_shipping_prices_shipping_price WHERE "productId" = p.id)'}
        OR ${input.delivery === false ? 'FALSE' : 'p."deliveryEnabled" = TRUE'})`);

    //Include products based on category criterias
    if (
      input.categoryIds ||
      input.selectionCategories ||
      input.seasonalCategories
    ) {
      query.innerJoin('category', 'c', '"categoryId" = c.id');

      if (input.categoryIds?.length) {
        query.andWhere(
          '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
          {
            categoryIds: input.categoryIds,
          },
        );
      } else if (input.selectionCategories) {
        query.leftJoin('category', 'parent', 'parent.id = c."parentId"');
        query.andWhere('(c."inSelection" OR parent."inSelection")');
      } else {
        query.leftJoin('category', 'parent', 'parent.id = c."parentId"');
        query.andWhere('(c."inSeason" OR parent."inSeason")');
      }
    }

    if (input.brandIds) {
      if (!input.brandIds.length) {
        query.andWhere('p."brandId" IS NULL');
      }
      if (input.brandIds.length) {
        query.andWhere('p."brandId" IN (:...brandIds)', {
          brandIds: input.brandIds,
        });
      }
    }

    if (input.conditions) {
      if (!input.conditions.length) {
        query.andWhere('p.condition IS NULL');
      }
      if (input.conditions.length) {
        query.andWhere('p.condition IN (:...conditions)', {
          conditions: input.conditions,
        });
      }
    }

    //Prices
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

    if (input.giveaway) {
      query.andWhere('"isGiveaway" = TRUE');
    }

    if (input.likedByUserIds) {
      query.innerJoin('product_liked_by_user', 'plbu', 'plbu.productId = p.id');
      query.andWhere('plbu.userId IN (:...likedByUserIds)', {
        likedByUserIds: input.likedByUserIds,
      });
    }

    if (input.excludeOwnProducts && userId) {
      query.andWhere('p.sellerId != :userId', { userId });
    }
    query.addOrderBy('p."status"');
    switch (input.orderBy) {
      case OrderProductsEnum.BEST_MATCH:
        if (input.searchString && input.searchString.length > 0) {
          query
            .addOrderBy('resultrank', 'DESC')
            .addOrderBy('p.createdAt', 'DESC');
        } else {
          query.addOrderBy('p.createdAt', 'DESC');
        }
        break;
      case OrderProductsEnum.OLDEST:
        query.addOrderBy('p.createdAt', 'ASC');
        break;
      case OrderProductsEnum.LATEST:
        query.addOrderBy('p.createdAt', 'DESC');
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
        query.addOrderBy('p.createdAt', 'DESC');
    }

    //limit defaults to 20 and may not exceed 40
    const limit = _limit ?? 20;
    query.limit(limit > 40 ? 40 : limit);
    query.offset((offset ?? 0) * limit);
    query.addSelect('count(*) over() as total');

    const result = await query.getManyAndCount();

    return {
      products: result[0],
      origin: origin
        ? { lat: origin.coordinates[0], lng: origin.coordinates[1] }
        : null,
      total: result[1],
    };
  }

  async findOne(id: string, currentUserId: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { messages: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    if (product.status === ProductStatus.DELETED) {
      const currentUserHasConnection = product.messages.some(
        (message) =>
          message.receiverId === currentUserId ||
          message.senderId === currentUserId,
      );
      if (!currentUserHasConnection) {
        throw BadUserInputException();
      }
    }

    return product;
  }

  async hide(id: string, reason: string, userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const product = await this.productRepository.findOneBy({
      id,
    });
    if (!user || !product) {
      throw BadUserInputException();
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', product, 'hiddenReason')) {
      throw ForbiddenException();
    }

    if (product.hiddenReason) {
      throw BadUserInputException('Product already hidden');
    }
    product.hiddenReason = reason;
    return this.productRepository.save(product);
  }

  async show(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const product = await this.productRepository.findOneBy({
      id,
    });
    if (!user || !product) {
      throw BadUserInputException();
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', product, 'hiddenReason')) {
      throw ForbiddenException();
    }

    product.hiddenReason = null;
    return await this.productRepository.save(product);
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
      relations: { images: true, documents: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    if (product.sellerId !== currentUserId) {
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
    if (draft.status !== ProductStatus.DRAFT) {
      throw BadUserInputException('Product is not draft');
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
  async approximatePlace(product: Product) {
    if (product.projectId) {
      const project = await this.projectService.findOne({
        id: product.projectId,
      });
      if (!project) {
        throw InternalServerException('No project found');
      }
      return await this.projectService.approximatePlace(project);
    }
    if (!product.addressLocation) {
      return null;
    }
    const approximation = await this.geocodingService.locationToApproximation({
      lat: product.addressLocation.coordinates[0],
      lng: product.addressLocation.coordinates[1],
    });
    const approximateAddress = approximation.address;
    return {
      address: approximateAddress,
      lat: approximation.lat,
      lng: approximation.lng,
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
        messages: true,
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
    await this.messageService.deleteMany(product.messages);
    await this.purchaseService.deleteMany(product.purchases);
    return await this.productRepository.remove(product);
  }

  async getPickupOption(input: GetTransportationOptionsInput) {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { project: true },
    });
    if (!product) {
      throw BadUserInputException();
    }

    if (!product.pickupEnabled) {
      return null;
    }
    if (product.project) {
      return await this.projectService.approximatePlace(product.project);
    }

    return await this.approximatePlace(product);
  }
  async getShippingOptions(input: GetTransportationOptionsInput) {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { shippingPrices: true },
    });
    if (!product || !input.postCode) {
      throw BadUserInputException();
    }

    return await Promise.all(
      product.shippingPrices.map(async (shippingPrice) => {
        const servicePoints =
          await this.shippingService.findNearbyServicePoints(
            input.postCode,
            shippingPrice.provider,
            4,
          );
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

        query.addOrderBy('p.createdAt', 'DESC');

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
    const query = this.productRepository.createQueryBuilder('p').innerJoin(
      'category',
      'c',
      `c.id = p."categoryId" AND c."parentId" IN (
          SELECT pc.id from product p
            INNER JOIN category c ON c.id = p."categoryId"
            INNER join category pc on pc.id = c."parentId"
            WHERE p.id = '${similarToProductId}')`,
    );
    query.addOrderBy('p.createdAt', 'DESC');

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
          title: ILike(`%${searchString}%`),
        },
        {
          status: Not(ProductStatus.DRAFT),
          seller: {
            username: ILike(`%${searchString}%`),
          },
        },
        {
          status: Not(ProductStatus.DRAFT),
          seller: {
            email: ILike(`%${searchString}%`),
          },
        },
        {
          status: Not(ProductStatus.DRAFT),
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

      const product = this.productRepository.create({
        sellerId,
        status: ProductStatus.PUBLISHED,
        price: price * 100,
        images: await this.fileService.createFiles(images),
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

      return {
        product: await this.productRepository.save(product),
        imagePutUrls: await this.fileService.uploadFiles(product.images, true),
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
      relations: { images: true },
    });

    if (!product) throw NotFoundException('Product not found');

    try {
      const {
        measurement,
        removeImages,
        addImages,
        price,
        deliveryRadius,
        deliveryPrice,
        shippingPriceIds,
        ...rest
      } = input;

      const location = await this.geocodingService.addressToLocation(
        input.address,
      );

      const images = product.images;
      const removeIds = new Set(removeImages);
      const keepImagesList = images.filter((img) => !removeIds.has(img.id));
      const removeImagesList = images.filter((img) => removeIds.has(img.id));

      await this.fileService.deleteFiles(removeImagesList);
      const addImagesList = await this.fileService.createFiles(addImages);

      const shippingPrices = await this.shippingPriceRepository.find({
        where: { id: In(shippingPriceIds) },
      });

      Object.assign<Product, Partial<Product>>(product, {
        addressLocation: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
        price: price * 100,
        images: [...keepImagesList, ...addImagesList],
        deliveryRadius: deliveryRadius ? deliveryRadius * 1000 : undefined,
        deliveryPrice: deliveryPrice ? deliveryPrice * 100 : undefined,
        shippingPrices: shippingPrices,
        ...rest,
        ...measurement,
      });

      return {
        product: await this.productRepository.save(product),
        imagePutUrls: await this.fileService.uploadFiles(product.images),
      };
    } catch (error) {
      throw BadUserInputException(`Failed to update product: ${error}`);
    }
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
}
