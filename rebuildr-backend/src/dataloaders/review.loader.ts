import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { User } from 'src/entities/user.entity';
import { DataSource, In } from 'typeorm';
import { DataloaderService } from './dataloader.service';
import { Review } from 'src/entities/review.entity';
import { Purchase } from 'src/entities/purchase.entity';

export interface IReviewLoaders {
  reviewerLoader: DataLoader<string, User>;
  revieweeLoader: DataLoader<string, User>;
  purchaseLoader: DataLoader<string, Purchase>;
}

@Injectable()
export class ReviewLoader {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly dataloaderService: DataloaderService,
  ) {}

  private reviewerLoader() {
    return new DataLoader(async (reviewIds) => {
      const reviews = await this.dataSource.getRepository(Review).find({
        where: {
          id: In(reviewIds),
        },
        relations: {
          reviewer: true,
        },
      });

      return reviewIds.map(
        (reviewId) =>
          reviews.find((review) => review.id === reviewId)?.reviewer,
      );
    });
  }

  private revieweeLoader() {
    return new DataLoader(async (reviewIds) => {
      const reviews = await this.dataSource.getRepository(Review).find({
        where: {
          id: In(reviewIds),
        },
        relations: {
          reviewee: true,
        },
      });

      return reviewIds.map(
        (reviewId) =>
          reviews.find((review) => review.reviewee.id === reviewId)?.reviewee,
      );
    });
  }
  createLoaders(): IReviewLoaders {
    return {
      reviewerLoader: this.reviewerLoader(),
      revieweeLoader: this.revieweeLoader(),
      purchaseLoader: this.dataloaderService.targetByParentIdLoader<Purchase>(
        'purchase',
        Review,
      ),
    };
  }
}
