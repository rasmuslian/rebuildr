import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { BadUserInputException } from 'src/exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private brandRepository: Repository<Brand>,
  ) {}

  async getBrand(id: string) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw BadUserInputException();
    }
    return brand;
  }

  async brands() {
    return await this.brandRepository.find({ order: { name: 'ASC' } });
  }
}
