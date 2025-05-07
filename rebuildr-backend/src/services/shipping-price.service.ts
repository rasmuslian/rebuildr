import { InjectRepository } from '@nestjs/typeorm';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ShippingPriceService {
  constructor(
    @InjectRepository(ShippingPrice)
    private shippingPriceRepository: Repository<ShippingPrice>,
  ) {}

  async getShippingPrice(id: string) {
    return await this.shippingPriceRepository.findOneBy({ id });
  }

  async getAll() {
    return await this.shippingPriceRepository.find({
      order: { maxWeight: 'ASC' },
    });
  }
}
