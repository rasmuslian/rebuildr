import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from 'src/entities/purchase.entity';
import { Review } from 'src/entities/review.entity';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import { CreateReviewInput } from 'src/resolvers/review.resolver';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  async createReview(input: CreateReviewInput, currentUserId: string) {
    if (input.stars < 1 || input.stars > 5) {
      throw BadUserInputException('Rating stars must be between 1 and 5');
    }

    const purchase = await this.purchaseRepository.findOne({
      where: { id: input.purchaseId },
      relations: { product: true, reviews: true },
    });

    if (!purchase) {
      throw BadUserInputException('Purchase not found');
    }

    if (
      purchase.reviews.some((review) => review.reviewerId === currentUserId)
    ) {
      throw BadUserInputException(
        'Reviewer has already reviewed this purchase',
      );
    }

    if (
      purchase.buyerId !== currentUserId &&
      purchase.product.sellerId !== currentUserId
    ) {
      throw ForbiddenException();
    }

    const reviewerId = currentUserId;
    const revieweeId =
      purchase.buyerId === reviewerId
        ? purchase.product.sellerId
        : purchase.buyerId;

    const review = new Review();
    review.stars = input.stars;
    review.review = input.review;
    review.reviewerId = reviewerId;
    review.revieweeId = revieweeId;
    review.purchase = purchase;
    return await this.reviewRepository.save(review);
  }
}
