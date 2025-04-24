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
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import {
  CreateProductResponse,
  FileInputType,
  OrderProductsEnum,
  ProductsInput,
  UpdateProductInput,
} from 'src/resolvers/product.resolver';
import { Equal, Point, Repository } from 'typeorm';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';
import { MessageService } from './message.service';
import { PurchaseService } from './purchase.service';
import { QuantityUnitEnum } from 'src/entities/enums';
import { Purchase } from 'src/entities/purchase.entity';
import { Logger } from 'winston';
import * as z from 'zod';
import { maximumEscrow, minimumEscrow } from 'src/constants/pricing';
import { File } from '../entities/file.entity';

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
        return this.fileService.createFile(image.mimeType);
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
    product.description = '';
    product.price = 0;
    product.status = ProductStatus.DRAFT;
    product.seller = seller;

    return await this.productRepository.save(product);
  }

  //A user must be admin or own the product to edit them
  // and the product can not have ongoing purchases on them
  async canEdit(product: Product, userId: string, userRole: UserRoleEnum) {
    if (userRole !== UserRoleEnum.ADMIN && userId !== product.sellerId) {
      return false;
    }

    //TODO: check that product does not have any ongoing purchases connected to it
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

    if (input.title !== undefined) {
      product.title = input.title;
    }
    if (input.description !== undefined) {
      product.description = input.description;
    }
    if (input.price !== undefined) {
      product.price = input.price * 100;
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
    }
    //null means removing the category
    if (!!input.categoryId || input.categoryId === null) {
      const category = await this.categoryRepository.findOne({
        where: { id: Equal(input.categoryId) },
      });
      product.category = category;
    }
    if (!!input.projectId || input.projectId === null) {
      product.projectId = input.projectId;
    }

    //Measurements
    if (input.height) {
      product.height = input.height;
    }
    if (input.width) {
      product.width = input.width;
    }
    if (input.length) {
      product.length = input.length;
    }
    if (input.thickness) {
      product.thickness = input.thickness;
    }
    if (input.diameter) {
      product.diameter = input.diameter;
    }
    if (input.weight) {
      product.weight = input.weight;
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

    //By this point we can validate the product, but only if it is to be published
    if (product.status === ProductStatus.PUBLISHED) {
      const parseResult = z
        .object({
          title: z.string().min(1),
          description: z.string().min(1),
          price: z.number().gte(1),
          conditionId: z.string().min(1),
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

      if (product.price < minimumEscrow) {
        logger.error({
          message: 'Too low price',
          price: product.price,
          minimumEscrow,
        });

        throw BadUserInputException('Too low price');
      }
      if (product.price > maximumEscrow) {
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
    const query = this.productRepository.createQueryBuilder('product');

    //Only admin will see hidden products
    if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw BadUserInputException('Invalid user');
      }
      if (user.role !== UserRoleEnum.ADMIN) {
        query.andWhere('hidden_reason IS NULL');
      }
    } else {
      query.andWhere('hidden_reason IS NULL');
    }

    if (input.searchString) {
      query.andWhere('position(LOWER(:searchString) in LOWER(title)) > 0', {
        searchString: input.searchString,
      });
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
        coordinates: [input.location.latitude, input.location.longitude],
      };
    }
    if (origin !== undefined) {
      //If distance is included, only select products whose distance to origin is less than input.distance
      if (input.distance) {
        //convert from km to meters
        const distance = input.distance * 1000;
        query.andWhere(
          'st_distancesphere(address_location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(address_location))) <= :distance',
          { origin, distance },
        );
      }
      query.addSelect(
        'st_distancesphere(address_location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(address_location)))',
        'distance_from_position',
      );

      if (input.orderBy === OrderProductsEnum.DISTANCE) {
        query.orderBy(
          'st_distancesphere(address_location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(address_location)))',
        );
      }
      query.setParameter('origin', origin);
    }

    //Include products based on category criterias
    if (
      input.categoryId ||
      input.selectionCategories ||
      input.seasonalCategories
    ) {
      query.innerJoin('category', 'c', 'category_id = c.id');

      if (input.categoryId) {
        query.andWhere('c.id = :categoryId OR c.parent_id = :categoryId', {
          categoryId: input.categoryId,
        });
      } else if (input.selectionCategories) {
        query.leftJoin('category', 'parent', 'parent.id = c.parent_id');
        query.andWhere('c.in_selection OR parent.in_selection');
      } else {
        query.leftJoin('category', 'parent', 'parent.id = c.parent_id');
        query.andWhere('c.in_season OR parent.in_season');
      }
    }

    if (input.giveaway) {
      query.andWhere('is_giveaway = TRUE');
    }

    if (input.condition) {
      query.andWhere('condition = :condition', { condition: input.condition });
    }

    //limit defaults to 20 and may not exceed 40
    const limit = _limit ?? 20;
    query.limit(limit > 40 ? 40 : limit);
    query.offset((offset ?? 0) * limit);
    query.addSelect('count(*) over() as total');

    if (input.orderBy === OrderProductsEnum.LATEST) {
      query.orderBy('created_at', 'DESC');
    }

    const result = await query.getRawMany();

    //Mapping result into Product.
    //Since we fetch with 'getRawMany' all fields which belong to the Product table
    //will be snake case and prefixed with 'product_'
    const mappedObjects = result.map((rawProduct) => {
      const prodObj = Object.entries(rawProduct).reduce((acc, entry) => {
        const [key, value] = entry;
        const removedPrefix = key.replace(/^product_/, '');
        const camelCaseKey = removedPrefix.replace(/(_\w)/g, function (match) {
          return match[1].toUpperCase();
        });
        return { ...acc, [camelCaseKey]: value };
      }, {});
      return prodObj;
    });

    return {
      products: mappedObjects,
      origin: origin
        ? { latitude: origin.coordinates[0], longitude: origin.coordinates[1] }
        : null,
      total: result[0]?.total ?? 0,
    };
  }

  async findOne(id: string) {
    return await this.productRepository.findOneBy({ id });
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
}
