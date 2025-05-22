import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { PurchaseService } from 'src/services/purchase.service';
import { SupportedPaymentMethod } from 'src/services/rocker.service';

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

@Resolver(() => Purchase)
export class PurchaseResolver {
  constructor(private purchaseService: PurchaseService) {}

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
}
