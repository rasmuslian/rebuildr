import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
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

  async findCategory(product: Product) {
    return await this.categoryRepository.findOneBy({ id: product.categoryId });
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: string) {
    return await this.productRepository.findOneBy({ id });
  }
}
