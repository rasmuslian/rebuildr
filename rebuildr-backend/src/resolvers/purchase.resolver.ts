import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { PurchaseService } from 'src/services/purchase.service';

@InputType()
class PurchaseProductInput {
  @Field()
  productId: string;
}

@ObjectType()
class PurchaseProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => Purchase)
  purchase: Purchase;
}

@Resolver()
export class PurchaseResolver {
  constructor(private purchaseService: PurchaseService) {}

  @Mutation(() => PurchaseProductResponse)
  @UseGuards(GqlAuthGuard)
  async purchaseProduct(
    @Args('input') input: PurchaseProductInput,
    @CurrentUser() _user: User,
  ) {
    return await this.purchaseService.purchase(input.productId, _user.id);
  }
}
