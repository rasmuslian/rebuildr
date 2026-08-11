import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { GetSearchResultsInput } from 'src/resolvers/search-result.resolver';
import { SearchResult } from 'src/entities/search-result.entity';
import { DataSource, In, IsNull } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Product,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { File } from 'src/entities/file.entity';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';

export interface IUserLoaders {
  getUserLoader: DataLoader<string, User>;
  projectsLoader: DataLoader<string, Project[]>;
  soldProductsLoader: DataLoader<string, Product[]>;
  publishedProductsLoader: DataLoader<string, Product[]>;
  productsLoader: DataLoader<string, Product[]>;
  purchasesLoader: DataLoader<string, Purchase[]>;
  salesLoader: DataLoader<string, Purchase[]>;
  likedProductsLoader: DataLoader<string, Product[]>;
  getSearchResultsLoader: (
    input: GetSearchResultsInput,
  ) => DataLoader<string, SearchResult[]>;
  profilePictureLoader: DataLoader<string, File>;
  ratingLoader: DataLoader<string, number>;
  reviewedLoader: DataLoader<string, Review[]>;
  totalCO2SavingsBuyer: DataLoader<string, number>;
  totalCO2SavingsSeller: DataLoader<string, number>;
  numberOfCompletedPurchases: DataLoader<string, number>;
}

@Injectable()
export class UserLoader {
  constructor(
    private dataloaderService: DataloaderService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private getUserLoader() {
    return new DataLoader<string, User>(async (userIds) => {
      const usersResult = await this.dataSource.getRepository(User).find({
        where: {
          id: In(userIds),
        },
      });

      return userIds.map((userId) =>
        usersResult.find((user) => user.id === userId),
      ) as User[];
    });
  }

  private getSearchResultsLoader(input: GetSearchResultsInput) {
    return new DataLoader<string, SearchResult[]>(async (userIds) => {
      const searchResults = await this.dataSource
        .getRepository(SearchResult)
        .find({
          where: {
            deletedAt: IsNull(),
            searcher: {
              id: In(userIds),
            },
          },
          take: input.pageSize,
          skip: input.page * input.pageSize,
          order: {
            updatedAt: 'DESC',
          },

          relations: ['searcher'],
        });

      const searchResultsMap = userIds.map((userId) =>
        searchResults.filter(
          (searchResult) => searchResult.searcher.id === userId,
        ),
      );
      return searchResultsMap;
    });
  }

  private soldProductsLoader() {
    return new DataLoader<string, Product[]>(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          sellerId: In(userIds),
          status: ProductStatus.SOLD,
          visibility: ProductVisibility.PUBLIC,
        },
      });

      const productsMap = userIds.map((userId) =>
        products.filter((product) => product.sellerId === userId),
      );
      return productsMap;
    });
  }

  private publishedProductsLoader() {
    return new DataLoader(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          seller: {
            id: In(userIds),
          },
          status: ProductStatus.PUBLISHED,
          visibility: ProductVisibility.PUBLIC,
          deletedAt: IsNull(),
        },
      });

      const productsMap = userIds.map((userId) =>
        products.filter((product) => product.sellerId === userId),
      );
      return productsMap;
    });
  }

  private productsLoader() {
    return new DataLoader(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          seller: {
            id: In(userIds),
          },
          status: In([ProductStatus.PUBLISHED, ProductStatus.SOLD]),
          visibility: ProductVisibility.PUBLIC,
          deletedAt: IsNull(),
        },
        order: { status: 'ASC', createdAt: 'DESC' },
      });

      const productsMap = userIds.map((userId) =>
        products.filter((product) => product.sellerId === userId),
      );
      return productsMap;
    });
  }

  private ratingLoader() {
    return new DataLoader(async (userIds) => {
      const reviews = await this.dataSource.getRepository(Review).find({
        where: {
          reviewee: { id: In(userIds) },
        },
      });

      const rating = userIds.map((userId) => {
        const userReviews = reviews.filter(
          (review) => review.revieweeId === userId,
        );
        if (!userReviews.length) {
          return null;
        }
        const sumRating = userReviews.reduce(
          (acc, curr) => acc + curr.stars,
          0,
        );

        const avgRating = sumRating / userReviews.length;
        return Math.round(avgRating * 10) / 10;
      });

      return rating;
    });
  }

  private salesLoader() {
    return new DataLoader(async (userIds) => {
      const purchases = await this.dataSource.getRepository(Purchase).find({
        where: {
          product: {
            sellerId: In(userIds),
          },
        },
        relations: { product: true },
      });

      return userIds.map((userId) =>
        purchases.filter((purchase) => purchase.product.sellerId === userId),
      );
    });
  }

  private likedProductsLoader() {
    return new DataLoader(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          likedBy: {
            id: In(userIds),
          },
        },
        relations: { likedBy: true },
      });

      return userIds.map((userId) =>
        products.filter((product) =>
          product.likedBy.some((user) => user.id === userId),
        ),
      );
    });
  }

  private reviewedLoader() {
    return new DataLoader(async (userIds) => {
      const reviews = await this.dataSource.getRepository(Review).find({
        where: {
          revieweeId: In(userIds),
        },
      });

      return userIds.map((userId) =>
        reviews.filter((review) => review.revieweeId === userId),
      );
    });
  }

  private totalCO2SavingsBuyer() {
    return new DataLoader<string, number>(async (userIds) => {
      const users: { userId: string; totalCO2Saving: number }[] =
        await this.dataSource
          .getRepository(User)
          .createQueryBuilder('u')
          .leftJoin(
            (qb) =>
              qb
                .select('pur."buyerId", SUM(p."co2SavingBuyer") as "co2"')
                .from(Purchase, 'pur')
                .innerJoin(
                  Product,
                  'p',
                  `p.id = pur."productId" AND p."soldByQuantity" = false`,
                )
                .where('pur."failedAt" IS NULL')
                .groupBy('pur."buyerId"'),
            'non_qty',
            'non_qty."buyerId" = u.id',
          )
          .leftJoin(
            (qb) =>
              qb
                .select(
                  'pur2."buyerId", SUM(pur2."purchasedQuantity" * p2."co2SavingBuyer") as "co2"',
                )
                .from(Purchase, 'pur2')
                .innerJoin(
                  Product,
                  'p2',
                  `p2.id = pur2."productId" AND p2."soldByQuantity" = true`,
                )
                .where('pur2."failedAt" IS NULL')
                .groupBy('pur2."buyerId"'),
            'qty',
            'qty."buyerId" = u.id',
          )
          .select(
            'u.id as "userId", COALESCE(non_qty."co2", 0) + COALESCE(qty."co2", 0) as "totalCO2Saving"',
          )
          .where('u.id IN (:...userIds)', { userIds })
          .getRawMany();

      return userIds.map(
        (userId) =>
          users.find((user) => user.userId === userId)?.totalCO2Saving ?? 0,
      );
    });
  }

  private totalCO2SavingsSeller() {
    return new DataLoader<string, number>(async (userIds) => {
      const users: { userId: string; totalCO2Saving: number }[] =
        await this.dataSource
          .getRepository(User)
          .createQueryBuilder('u')
          .leftJoin(
            (qb) =>
              qb
                .select('p."sellerId", SUM(p."co2SavingSeller") as "co2"')
                .from(Product, 'p')
                .where(
                  `p."soldByQuantity" = false AND p.status = '${ProductStatus.SOLD}'`,
                )
                .groupBy('p."sellerId"'),
            'non_qty',
            'non_qty."sellerId" = u.id',
          )
          .leftJoin(
            (qb) =>
              qb
                .select(
                  'p2."sellerId", SUM(pur."purchasedQuantity" * p2."co2SavingSeller") as "co2"',
                )
                .from(Purchase, 'pur')
                .innerJoin(
                  Product,
                  'p2',
                  `p2.id = pur."productId" AND p2."soldByQuantity" = true`,
                )
                .where('pur."failedAt" IS NULL')
                .groupBy('p2."sellerId"'),
            'qty',
            'qty."sellerId" = u.id',
          )
          .select(
            'u.id as "userId", COALESCE(non_qty."co2", 0) + COALESCE(qty."co2", 0) as "totalCO2Saving"',
          )
          .where('u.id IN (:...userIds)', { userIds })
          .getRawMany();

      return userIds.map(
        (userId) =>
          users.find((user) => user.userId === userId)?.totalCO2Saving ?? 0,
      );
    });
  }

  private projectsLoader() {
    return new DataLoader<string, Project[]>(async (userIds) => {
      const projects = await this.dataSource.getRepository(Project).find({
        where: { userId: In([...userIds]), internalOrganizationId: IsNull() },
        order: { createdAt: 'DESC' },
      });
      return userIds.map((userId) =>
        projects.filter((project) => project.userId === userId),
      );
    });
  }

  private numberOfCompletedPurchases() {
    return new DataLoader<string, number>(async (userIds) => {
      const counts: { userId: string; count: string }[] = await this.dataSource
        .getRepository(Purchase)
        .createQueryBuilder('pur')
        .select('pur."buyerId" as "userId", COUNT(pur.id) as "count"')
        .where('pur."buyerId" IN (:...userIds)', { userIds })
        .andWhere('pur."failedAt" IS NULL')
        .groupBy('pur."buyerId"')
        .getRawMany();

      return userIds.map((userId) =>
        parseInt(counts.find((c) => c.userId === userId)?.count ?? '0'),
      );
    });
  }

  createLoaders(): IUserLoaders {
    return {
      getUserLoader: this.getUserLoader(),
      projectsLoader: this.projectsLoader(),
      getSearchResultsLoader: (input: GetSearchResultsInput) =>
        this.getSearchResultsLoader(input),
      soldProductsLoader: this.soldProductsLoader(),
      publishedProductsLoader: this.publishedProductsLoader(),
      productsLoader: this.productsLoader(),
      profilePictureLoader: this.dataloaderService.targetByParentIdLoader<File>(
        'profilePicture',
        User,
      ),
      ratingLoader: this.ratingLoader(),
      purchasesLoader: this.dataloaderService.targetByParentIdLoader<
        Purchase[]
      >('purchases', User),
      salesLoader: this.salesLoader(),
      likedProductsLoader: this.likedProductsLoader(),
      reviewedLoader: this.reviewedLoader(),
      totalCO2SavingsBuyer: this.totalCO2SavingsBuyer(),
      totalCO2SavingsSeller: this.totalCO2SavingsSeller(),
      numberOfCompletedPurchases: this.numberOfCompletedPurchases(),
    };
  }
}
