import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  InputType,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { ProductService } from 'src/services/product.service';

@InputType()
export class CreateProductInput {
  @Field()
  title: string;

  @Field()
  categoryId: string;

  @Field(() => Float)
  price: number;
}

@Resolver(() => Product)
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => [Product])
  async products() {
    return this.productService.getAll();
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createProduct(
    @CurrentUser() _user: User,
    @Args('input') input: CreateProductInput,
  ) {
    return this.productService.create({
      title: input.title,
      categoryId: input.categoryId,
      userId: _user.id,
      price: input.price,
    });
  }

  @ResolveField(() => Category)
  async category(@Root() _product: Product) {
    return this.productService.getCategory(_product);
  }
}
