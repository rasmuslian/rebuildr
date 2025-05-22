import {
  Context,
  Field,
  InputType,
  Int,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IReviewLoaders } from 'src/dataloaders/review.loader';
import { Purchase } from 'src/entities/purchase.entity';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';

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

@Resolver(() => Review)
export class ReviewResolver {
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
