import { InjectRepository } from '@nestjs/typeorm';
import {
  ShippingPrice,
  ShippingProviderEnum,
} from 'src/entities/shipping-price.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
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

  /**
   *
   * @param weight weight of package
   * @returns The smallest shippingPrice in regards to 'maxWeight' which is not smaller than 'weight'.
   */
  async shippingPriceMatchingWeight(
    weight: number,
    provider: ShippingProviderEnum = ShippingProviderEnum.POSTNORD,
  ) {
    return await this.shippingPriceRepository.findOne({
      where: {
        provider,
        maxWeight: MoreThanOrEqual(weight),
      },
      order: { maxWeight: 'ASC' },
    });
  }

  async getAll() {
    return await this.shippingPriceRepository.find({
      order: { maxWeight: 'ASC' },
    });
  }
}
