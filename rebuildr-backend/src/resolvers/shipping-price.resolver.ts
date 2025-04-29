import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  InputType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { ShippingPriceService } from 'src/services/shipping-price.service';

@InputType()
class GetShippingPriceInput {
  @Field()
  id: string;
}

@Resolver(() => ShippingPrice)
export class ShippingPriceResolver {
  constructor(private shippingPriceService: ShippingPriceService) {}

  @Query(() => ShippingPrice)
  @UseGuards(GqlAuthGuard)
  async getShippingPrice(@Args('input') input: GetShippingPriceInput) {
    return await this.shippingPriceService.getShippingPrice(input.id);
  }

  @Query(() => [ShippingPrice])
  @UseGuards(GqlAuthGuard)
  async getAllShippingPrices() {
    return await this.shippingPriceService.getAll();
  }

  @ResolveField(() => Float)
  async price(@Parent() shippingPrice: ShippingPrice) {
    return shippingPrice.price / 100;
  }
}
