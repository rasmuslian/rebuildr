import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Point, Repository } from 'typeorm';
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
    private geocodingService: GeocodingService,
  ) {}

  async create(input: {
    title: string;
    categoryId: string;
    userId: string;
    price: number;
    address: string;
  }) {
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
    return await this.productRepository.save(product);
  }

  async findAll(input: {
    searchString?: string;
    address?: string;
    distance?: number;
    categoryId?: string;
  }) {
    const query = this.productRepository.createQueryBuilder('product');

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
    if (input.categoryId) {
      query.leftJoin('category', 'c', 'category_id = c.id');
      query.andWhere('c.id = :categoryId OR c.parent_id = :categoryId', {
        categoryId: input.categoryId,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string) {
    return await this.productRepository.findOneBy({ id });
  }
}
