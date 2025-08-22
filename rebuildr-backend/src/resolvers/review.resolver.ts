import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { IReviewLoaders } from 'src/dataloaders/review.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Purchase } from 'src/entities/purchase.entity';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';
import { ReviewService } from 'src/services/review.service';

@InputType()
export class ReviewUserInput {
  @Field(() => String)
  revieweeId: string;

  @Field(() => Int)
  stars: number;

  @Field(() => String)
  review: string;

  @Field(() => String)
  productId: string;
}

@InputType()
export class CreateReviewInput {
  @Field()
  purchaseId: string;

  @Field()
  review: string;

  @Field(() => Int)
  stars: number;
}

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private reviewService: ReviewService) {}

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.reviewService.createReview(input, user.id);
  }
  @ResolveField(() => User)
  async reviewer(
    @Parent() review: Review,
    @Context('reviewLoaders') reviewLoaders: IReviewLoaders,
  ) {
    return reviewLoaders.reviewerLoader.load(review.id);
  }

  @ResolveField(() => User)
  async reviewee(
    @Parent() review: Review,
    @Context('reviewLoaders') reviewLoaders: IReviewLoaders,
  ) {
    return reviewLoaders.revieweeLoader.load(review.id);
  }

  @ResolveField(() => Purchase)
  async purchase(
    @Parent() review: Review,
    @Context('reviewLoaders') reviewLoaders: IReviewLoaders,
  ) {
    return reviewLoaders.purchaseLoader.load(review.id);
  }
}
