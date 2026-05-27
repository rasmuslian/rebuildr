import { Injectable } from '@nestjs/common';
import { DataSource, In, SelectQueryBuilder } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { DataloaderService } from './dataloader.service';
import { Brand } from 'src/entities/brand.entity';
import { Project } from 'src/entities/project.entity';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { ReportProduct } from 'src/entities/report-product.entity';
import { MapPin } from 'src/entities/map-pin.entity';
import { LocationInputType } from 'src/resolvers/geocoding.resolver';
import { Category } from 'src/entities/category.entity';

export interface IProductLoaders {
  getProduct: DataLoader<string, Product>;
  likedByUserLoader: DataLoader<{ productId: string; userId: string }, boolean>;
  sellerLoader: DataLoader<string, User>;
  primaryImageLoader: DataLoader<string, File>;
  imagesLoader: DataLoader<string, File[]>;
  documentsLoader: DataLoader<string, File[]>;
  brandLoader: DataLoader<string, Brand>;
  projectLoader: DataLoader<string, Project>;
  shippingPricesLoader: DataLoader<string, ShippingPrice[]>;
  getProductPurchases: DataLoader<string, Purchase[]>;
  getReportProducts: DataLoader<string, ReportProduct[]>;
  mapPinLoader: DataLoader<string, MapPin>;
  distanceToLocationLoader: DataLoader<
    { productId: string; location: LocationInputType },
    number
  >;
  categoryLoader: DataLoader<string, Category>;
}

@Injectable()
export class ProductLoader {
  constructor(
    private readonly dataSource: DataSource,
    private readonly dataloaderService: DataloaderService,
  ) {}

  private getProduct() {
    return new DataLoader<string, Product>(async (productIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          id: In(productIds),
        },
      });

      return productIds.map((id) =>
        products.find((product) => product.id === id),
      ) as Product[];
    });
  }

  private likedByUserLoader() {
    return new DataLoader(
      async (keys: readonly { productId: string; userId: string }[]) => {
        const userId = keys[0]?.userId;
        const productIds = keys.map((k) => k.productId);

        const products = await this.dataSource.getRepository(Product).find({
          where: { id: In(productIds), likedBy: { id: userId } },
        });

        return productIds.map((id) =>
          products.find((p) => p.id === id) ? true : false,
        );
      },
    );
  }

  private sellerLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { seller: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.seller);
    });
  }

  private primaryImageLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { images: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.images?.[0]);
    });
  }

  private mapPinLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          id: In(keys),
        },
        relations: { mapPin: true, project: { mapPin: true } },
      });
      return keys.map((key) => {
        const product = products.find((p) => p.id === key);
        return product?.project?.mapPin || product?.mapPin || null;
      });
    });
  }

  private distanceToLocationLoader() {
    return new DataLoader(
      async (
        keys: readonly {
          productId: string;
          location: { lat: number; lng: number };
        }[],
      ) => {
        const ids = keys.map((k) => k.productId);
        const location = keys[0].location;
        const locationPoint = {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        };

        const data = await this.dataSource
          .createQueryBuilder()
          .select('id')
          .addSelect(
            'st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON(:locationPoint), ST_SRID("addressLocation")))',
            'distance',
          )
          .setParameter('locationPoint', locationPoint)
          .from(
            (
              qb: SelectQueryBuilder<{ id: string; addressLocation: string }>,
            ) => {
              return qb
                .subQuery()
                .select('p.id', 'id')
                .from('product', 'p')
                .leftJoin('project', 'pj', 'p."projectId" = pj.id')
                .addSelect(
                  'CASE WHEN pj.id IS NOT NULL THEN pj."addressLocation" ELSE p."addressLocation" END "addressLocation"',
                )
                .where('p.id IN (:...ids)', { ids });
            },
            'inner',
          )
          .getRawMany();

        return keys.map(
          (key) => data.find((r) => r.id === key.productId)?.distance,
        );
      },
    );
  }

  createLoaders(): IProductLoaders {
    return {
      getProduct: this.getProduct(),
      likedByUserLoader: this.likedByUserLoader(),
      sellerLoader: this.sellerLoader(),
      primaryImageLoader: this.primaryImageLoader(),
      imagesLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'images',
        Product,
      ),
      documentsLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'documents',
        Product,
      ),
      brandLoader: this.dataloaderService.targetByParentIdLoader<Brand>(
        'brand',
        Product,
      ),
      projectLoader: this.dataloaderService.targetByParentIdLoader<Project>(
        'project',
        Product,
      ),
      shippingPricesLoader: this.dataloaderService.targetByParentIdLoader<
        ShippingPrice[]
      >('shippingPrices', Product),
      getProductPurchases: this.dataloaderService.targetByParentIdLoader<
        Purchase[]
      >('purchases', Product),
      getReportProducts: this.dataloaderService.targetByParentIdLoader<
        ReportProduct[]
      >('reportProducts', Product),
      mapPinLoader: this.mapPinLoader(),
      distanceToLocationLoader: this.distanceToLocationLoader(),
      categoryLoader: this.dataloaderService.targetByParentIdLoader<Category>(
        'category',
        Product,
      ),
    };
  }
}
