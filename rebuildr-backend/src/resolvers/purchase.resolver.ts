import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { RequestId } from 'src/decorators/request-id.decorator';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Review } from 'src/entities/review.entity';
import { PurchaseService } from 'src/services/purchase.service';
import { SupportedPaymentMethod } from 'src/services/rocker.service';
import { Logger } from 'winston';

@InputType()
class PurchaseProductInput {
  @Field()
  productId: string;

  @Field(() => SupportedPaymentMethod)
  paymentMethod: SupportedPaymentMethod;
}

@ObjectType()
class PurchaseProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => Purchase)
  purchase: Purchase;
}

@InputType()
class AcceptPurchaseInput {
  @Field()
  purchaseId: string;
}

@InputType()
export class LatestPurchaseInput {
  @Field()
  buyerId: string;
  @Field()
  sellerId: string;
  @Field()
  productId: string;
}

@InputType()
class MarkPurchaseAsDeliveredInput {
  @Field()
  purchaseId: string;
}

@Resolver(() => Purchase)
export class PurchaseResolver {
  constructor(
    private purchaseService: PurchaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Query(() => Purchase, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async latestPurchase(
    @Args('input') input: LatestPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.latestPurchase(input, user.id);
  }

  @Mutation(() => PurchaseProductResponse)
  @UseGuards(GqlAuthGuard)
  async purchaseProduct(
    @Args('input') input: PurchaseProductInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.purchaseService.createPurchase(
      input.productId,
      _user.id,
      input.paymentMethod,
    );
  }

  @Mutation(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async acceptPurchase(
    @Args('input') input: AcceptPurchaseInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.purchaseService.manualAcceptPurchase(
      input.purchaseId,
      _user.id,
    );
  }

  @Mutation(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async markPurchaseAsDelivered(
    @Args('input') input: MarkPurchaseAsDeliveredInput,
    @CurrentUser() user: AuthedUserType,
    @RequestId() requestId: string,
  ) {
    const childLogger = this.logger.child({
      requestId,
      userId: user.id,
      purchaseId: input.purchaseId,
    });
    return await this.purchaseService.markAsDelivered(
      input.purchaseId,
      user.id,
      childLogger,
    );
  }

  @ResolveField(() => Boolean)
  async isShipping(@Parent() purchase: Purchase) {
    return this.purchaseService.isShipping(purchase);
  }

  @ResolveField(() => [Review])
  async reviews(@Parent() purchase: Purchase) {
    return this.purchaseService.reviews(purchase);
  }
}
