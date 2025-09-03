import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { GetSearchResultsInput } from 'src/resolvers/search-result.resolver';
import { SearchResult } from 'src/entities/search-result.entity';
import { DataSource, In, IsNull } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { File } from 'src/entities/file.entity';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';

export interface IUserLoaders {
  getUserLoader: DataLoader<string, User>;
  projectsLoader: DataLoader<string, Project[]>;
  soldProductsLoader: DataLoader<string, Product[]>;
  publishedProductsLoader: DataLoader<string, Product[]>;
  purchasesLoader: DataLoader<string, Purchase[]>;
  salesLoader: DataLoader<string, Purchase[]>;
  likedProductsLoader: DataLoader<string, Product[]>;
  getSearchResultsLoader: (
    input: GetSearchResultsInput,
  ) => DataLoader<string, SearchResult[]>;
  profilePictureLoader: DataLoader<string, File>;
  ratingLoader: DataLoader<string, number>;
  reviewedLoader: DataLoader<string, Review[]>;
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
          deletedAt: IsNull(),
        },
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
        if (!reviews.length) {
          return null;
        }
        const sumRating = userReviews.reduce(
          (acc, curr) => acc + curr.stars,
          0,
        );
        const avgRating = sumRating / reviews.length;
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

  createLoaders(): IUserLoaders {
    return {
      getUserLoader: this.getUserLoader(),
      projectsLoader: this.dataloaderService.targetByParentIdLoader<Project[]>(
        'projects',
        User,
      ),
      getSearchResultsLoader: (input: GetSearchResultsInput) =>
        this.getSearchResultsLoader(input),
      soldProductsLoader: this.soldProductsLoader(),
      publishedProductsLoader: this.publishedProductsLoader(),
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
    };
  }
}
