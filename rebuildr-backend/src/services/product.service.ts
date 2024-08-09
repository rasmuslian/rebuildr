import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/caslAbility.factory';
import { Category } from 'src/entities/category.entity';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import {
  CreateProductResponse,
  FileInputType,
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
  }): Promise<CreateProductResponse> {
    const product = new Product();

    const category = await this.categoryRepository.findOneBy({
      id: input.categoryId,
    });
    if (!category) {
      throw new Error('Invalid category');
    }

    const user = await this.userRepository.findOneBy({ id: input.userId });
    if (!user) {
      throw new Error('Invalid user');
    }

    product.title = input.title;
    product.category = category;
    product.user = user;
    product.price = input.price;
    product.address = input.address;
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
    input: {
      searchString?: string;
      address?: string;
      distance?: number;
      categoryId?: string;
      selectionCategories?: boolean;
    },
    _user?: User,
  ) {
    const query = this.productRepository.createQueryBuilder('product');

    //Only admin will see hidden products
    if (_user) {
      const user = await this.userRepository.findOneBy({ id: _user.id });
      if (!user) {
        throw new Error('Invalid user');
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
    if (input.address) {
      //find coordinates of address
      const location = await this.geocodingService.addressToLocation(
        input.address,
      );
      const origin: Point = {
        type: 'Point',
        coordinates: [location.latitude, location.longitude],
      };

      //If distance is included, only select products whose distance to origin is less than input.distance
      if (input.distance) {
        //convert from km to meters
        const distance = input.distance * 1000;
        query.andWhere(
          'st_distancesphere(address_location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(address_location))) <= :distance',
          { origin, distance },
        );
        query.setParameter('distance', distance);
      }

      query.orderBy(
        'st_distancesphere(address_location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(address_location)))',
      );
      query.setParameter('origin', origin);
    }
    //Will find products matching the category. Also includes all products where 'categoryId' is the parent of their category
    if (input.categoryId || input.selectionCategories) {
      query.leftJoin('category', 'c', 'category_id = c.id');

      if (input.categoryId) {
        query.andWhere('c.id = :categoryId OR c.parent_id = :categoryId', {
          categoryId: input.categoryId,
        });
      } else {
        query.leftJoin('category', 'parent', 'parent.id = c.parent_id');
        query.andWhere('c.in_selection OR parent.in_selection');
      }
    }

    return await query.getMany();
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
      throw new BadRequestException();
    }
    const ability = this.caslAbilityFactory.createForUser(user);
    const allowed = ability.can('delete', product);
    if (!allowed) {
      throw new ForbiddenException();
    }

    try {
      await this.fileService.deleteMany(product.images);
      await this.messageRepository.delete({ productId: product.id });
      await this.productRepository.delete(product.id);
    } catch (e) {
      throw new Error(e);
    }

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
      throw new BadRequestException();
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', product, 'hiddenReason')) {
      throw new ForbiddenException();
    }

    if (product.hiddenReason) {
      throw new BadRequestException('Product already hidden');
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
      throw new BadRequestException();
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', product, 'hiddenReason')) {
      throw new ForbiddenException();
    }

    product.hiddenReason = null;
    return await this.productRepository.save(product);
  }
}
