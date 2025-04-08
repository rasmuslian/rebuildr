import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Category } from 'src/entities/category.entity';
import { Message } from 'src/entities/message.entity';
import { Product, ProductConditionEnum } from 'src/entities/product.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import {
  CreateProductResponse,
  FileInputType,
  OrderProductsEnum,
  ProductsInput,
} from 'src/resolvers/product.resolver';
import { Point, Repository } from 'typeorm';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private geocodingService: GeocodingService,
    private fileService: FileService,
    private caslAbilityFactory: CaslAbilityFactory,
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
    product.brand = input.brand;
    product.amount = input.amount;
    product.height = input.height;
    product.width = input.width;
    product.depth = input.depth;
    product.volume = input.volume;
    product.condition = input.condition;
    product.description = input.description;
    const location = await this.geocodingService.addressToLocation(
      input.address,
    );
    product.addressLocation = {
      type: 'Point',
      coordinates: [location.latitude, location.longitude],
    };
    const images = await Promise.all(
      input.images?.map((image) => {
        return this.fileService.create(image.mimeType);
      }) ?? [],
    );

    product.images = images.map((image) => image.file);
    const createdProduct = await this.productRepository.save(product);

    return {
      product: createdProduct,
      presignedPutUrls: images.map((image) => image.signedUrl),
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
        coordinates: [location.latitude, location.longitude],
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

  async delete(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!user || !product) {
      throw BadUserInputException();
    }
    const ability = this.caslAbilityFactory.createForUser(user);
    const allowed = ability.can('delete', product);
    if (!allowed) {
      throw ForbiddenException();
    }

    await this.fileService.deleteMany(product.images);
    await this.messageRepository.delete({ productId: product.id });
    await this.productRepository.delete(product.id);

    return { title: product.title };
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
}
