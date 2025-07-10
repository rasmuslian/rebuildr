import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, In } from 'typeorm';
import { DataloaderService } from './dataloader.service';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import DataLoader from 'dataloader';

export interface IPurchaseLoaders {
  getProduct: DataLoader<string, Product>;
  getBuyer: DataLoader<string, User>;
  getShippingPrice: DataLoader<string, ShippingPrice>;
}

@Injectable()
export class PurchaseLoader {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly dataloaderService: DataloaderService,
  ) {}

  private productLoader() {
    return new DataLoader(async (purchaseIds: readonly string[]) => {
      const purchasesWithProduct = await this.dataSource
        .getRepository(Purchase)
        .find({
          where: { id: In(purchaseIds) },
          relations: { product: true },
        });

      //make sure data is returned in the correct order by mapping from keys
      return purchaseIds.map(
        (id) =>
          purchasesWithProduct.find((purchase) => purchase.id === id)?.product,
      ) as Product[];
    });
  }
  private buyerLoader() {
    return new DataLoader(async (purchaseIds: readonly string[]) => {
      const purchasesWithBuyer = await this.dataSource
        .getRepository(Purchase)
        .find({
          where: { id: In(purchaseIds) },
          relations: { buyer: true },
        });

      //make sure data is returned in the correct order by mapping from keys
      return purchaseIds.map(
        (id) =>
          purchasesWithBuyer.find((purchase) => purchase.id === id)?.buyer,
      ) as User[];
    });
  }

  createLoaders(): IPurchaseLoaders {
    return {
      getProduct: this.productLoader(),
      getBuyer: this.buyerLoader(),
      getShippingPrice:
        this.dataloaderService.targetByParentIdLoader<ShippingPrice>(
          'shippingPrice',
          Purchase,
        ),
    };
  }
}
