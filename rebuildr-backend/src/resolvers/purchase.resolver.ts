import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { RequestId } from 'src/decorators/request-id.decorator';
import { Product } from 'src/entities/product.entity';
import {
  Purchase,
  SupportedPaymentMethod,
  TransportationEnum,
} from 'src/entities/purchase.entity';
import { Review } from 'src/entities/review.entity';
import {
  ShippingPrice,
  ShippingProviderEnum,
} from 'src/entities/shipping-price.entity';
import { PurchaseService } from 'src/services/purchase.service';
import { ConversationService } from 'src/services/conversation.service';
import { Logger } from 'winston';
import { LocationInputType } from './geocoding.resolver';
import { IPurchaseLoaders } from 'src/dataloaders/purchase.loader';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { ReportPurchase } from 'src/entities/report-purchase.entity';
import { Conversation } from 'src/entities/conversation.entity';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@InputType()
class GetPurchaseInput {
  @Field()
  id: string;
}
@InputType()
export class PurchaseProductInput {
  @Field()
  productId: string;

  //When this is null, user expects the purchase to be free
  @Field(() => SupportedPaymentMethod, { nullable: true })
  paymentMethod?: SupportedPaymentMethod;

  @Field({ nullable: true })
  servicePointId?: string;

  @Field(() => ShippingProviderEnum, { nullable: true })
  shippingProvider?: ShippingProviderEnum;

  @Field(() => LocationInputType, { nullable: true })
  deliverToLocation?: LocationInputType;

  @Field(() => String, { nullable: true })
  deliverToAddress?: string;

  @Field(() => TransportationEnum)
  transportationMethod: TransportationEnum;

  @Field({ nullable: true })
  successUrl: string;

  @Field({ nullable: true })
  failureUrl: string;

  @Field(() => Int, { nullable: true })
  purchasedQuantity?: number;
}

@ObjectType()
class PurchaseProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => Purchase)
  purchase: Purchase;

  @Field({ nullable: true })
  reference?: string;
}

@InputType()
class AcceptPurchaseInput {
  @Field()
  purchaseId: string;
}

@InputType()
export class LatestPurchaseInput {
  @Field()
  otherUserId: string;
  @Field()
  productId: string;
}

@InputType()
export class MyPurchaseInput {
  @Field()
  productId: string;
}
@InputType()
export class MyPurchasesInput {
  @Field({ nullable: true })
  myRole?: 'buyer' | 'seller';
}

@InputType()
class MarkPurchaseAsDeliveredInput {
  @Field()
  purchaseId: string;
}

@InputType()
class CancelPurchaseInput {
  @Field()
  purchaseId: string;
}
@InputType()
class AbortPurchaseInput {
  @Field()
  purchaseId: string;
}

@InputType()
export class CmsRefundPurchaseInput {
  @Field()
  purchaseId: string;
}

@InputType()
export class CmsListPurchasesInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  searchString?: string;

  @Field(() => PurchaseStatusEnum, { nullable: true })
  status?: PurchaseStatusEnum;
}

@ObjectType()
export class CmsListPurchasesResponse {
  @Field(() => [Purchase])
  purchases: Purchase[];

  @Field(() => Int)
  total: number;
}

export enum CanAbortDeniedReasonEnum {
  SHIPPING = 'SHIPPING',
  HANDOFF = 'HANDOFF',
}
registerEnumType(CanAbortDeniedReasonEnum, {
  name: 'CanAbortDeniedReasonEnum',
});
@ObjectType()
export class CanAbortResponse {
  @Field(() => CanAbortDeniedReasonEnum)
  deniedReason: CanAbortDeniedReasonEnum;
}

@Resolver(() => Purchase)
export class PurchaseResolver {
  constructor(
    @Inject(forwardRef(() => PurchaseService))
    private purchaseService: PurchaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private conversationService: ConversationService,
  ) {}

  @Query(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async purchase(
    @Args('input') input: GetPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.getPurchase(input.id, user.id);
  }

  @Query(() => Purchase, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async latestPurchase(
    @Args('input') input: LatestPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.latestPurchase(input, user.id);
  }

  @Query(() => Purchase, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async myPurchase(
    @Args('input') input: MyPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.myPurchase(input, user.id);
  }

  @Query(() => [Purchase])
  @UseGuards(GqlAuthGuard)
  async myPurchases(
    @Args('input') input: MyPurchasesInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.myPurchases(input, user.id);
  }

  @Mutation(() => PurchaseProductResponse)
  @UseGuards(GqlAuthGuard)
  async purchaseProduct(
    @Args('input') input: PurchaseProductInput,
    @CurrentUser() _user: AuthedUserType,
    @RequestId() requestId: string,
  ) {
    const childLogger = this.logger.child({
      requestId,
      userId: _user.id,
      productId: input.productId,
    });
    return await this.purchaseService.createPurchase(
      input,
      _user.id,
      childLogger,
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

  @Mutation(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async cancelPurchase(
    @Args('input') input: CancelPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.cancelPurchase(input.purchaseId, user.id);
  }

  @Mutation(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async abortPurchase(
    @Args('input') input: AbortPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.purchaseService.abortPurchase(input.purchaseId, user.id);
  }

  @Mutation(() => CmsListPurchasesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListPurchases(
    @Args('input') input: CmsListPurchasesInput,
  ): Promise<CmsListPurchasesResponse> {
    return this.purchaseService.cmsListPurchases(input);
  }

  @Mutation(() => Purchase)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsRefundPurchase(
    @Args('input') input: CmsRefundPurchaseInput,
    @RequestId() requestId: string,
  ): Promise<Purchase> {
    const childLogger = this.logger.child({
      requestId,
      purchaseId: input.purchaseId,
    });
    return this.purchaseService.cmsRefundPurchase(
      input.purchaseId,
      childLogger,
    );
  }

  @Mutation(() => Int)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsBackfillPayoutBankDetails(
    @RequestId() requestId: string,
  ): Promise<number> {
    const childLogger = this.logger.child({ requestId });
    return this.purchaseService.cmsBackfillPayoutBankDetails(childLogger);
  }

  @ResolveField(() => Boolean)
  async isShipping(@Parent() purchase: Purchase) {
    return this.purchaseService.isShipping(purchase);
  }

  @ResolveField(() => [Review])
  async reviews(@Parent() purchase: Purchase) {
    return this.purchaseService.reviews(purchase);
  }

  @ResolveField(() => User)
  async buyer(
    @Parent() purchase: Purchase,
    @Context('purchaseLoaders') purchaseLoaders: IPurchaseLoaders,
  ) {
    return await purchaseLoaders.getBuyer.load(purchase.id);
  }

  @ResolveField(() => ShippingPrice, { nullable: true })
  async shippingPrice(
    @Parent() purchase: Purchase,
    @Context('purchaseLoaders') purchaseLoaders: IPurchaseLoaders,
  ) {
    return await purchaseLoaders.getShippingPrice.load(purchase.id);
  }

  @ResolveField(() => Product)
  async product(
    @Parent() purchase: Purchase,
    @Context('purchaseLoaders') purchaseLoaders: IPurchaseLoaders,
  ) {
    return await purchaseLoaders.getProduct.load(purchase.id);
  }

  @ResolveField(() => Boolean)
  async isFree(@Parent() purchase: Purchase) {
    return !purchase.paymentIntentId;
  }

  @ResolveField(() => Boolean)
  async isRefunded(@Parent() purchase: Purchase) {
    return !!purchase.refundId;
  }

  @ResolveField(() => Boolean)
  async boughtForFree(@Parent() purchase: Purchase) {
    return await this.purchaseService.boughtForFree(purchase);
  }

  @ResolveField(() => ReportPurchase, { nullable: true })
  async reportPurchase(
    @Parent() purchase: Purchase,
    @Context('purchaseLoaders') purchaseLoaders: IPurchaseLoaders,
  ) {
    return await purchaseLoaders.getReportPurchase.load(purchase.id);
  }

  @ResolveField(() => Conversation, { nullable: true })
  async conversation(@Parent() purchase: Purchase) {
    return this.conversationService.getConversationByPurchaseId(purchase.id);
  }

  @ResolveField(() => CanAbortResponse, { nullable: true })
  async canAbort(@Parent() purchase: Purchase) {
    return this.purchaseService.canAbortPurchase(purchase);
  }

  @ResolveField(() => String)
  @UseGuards(GqlAuthGuard)
  async payoutBankLast4(
    @Parent() purchase: Purchase,
    @CurrentUser() user: AuthedUserType,
  ) {
    const account = await this.purchaseService.getPayoutBank(purchase, user.id);
    return account.last4;
  }
}
