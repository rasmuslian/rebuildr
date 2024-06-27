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
import { ZodValidationPipe } from 'src/pipes/zodValidationPipe';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import z from 'zod';

@InputType()
export class CreateProductInput {
  @Field()
  title: string;

  @Field()
  categoryId: string;

  @Field(() => Float)
  price: number;

  @Field(() => String)
  address: string;
}
const createProductSchema = z.object({
  title: z.string(),
  categoryId: z.string(),
  price: z.number(),
  address: z.string(),
});

@InputType()
export class GetProductInput {
  @Field()
  id: string;
}

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private userService: UserService,
  ) {}

  @Query(() => Product)
  async product(@Args('input') input: GetProductInput) {
    return this.productService.findOne(input.id);
  }

  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createProduct(
    @CurrentUser() _user: User,
    @Args('input', new ZodValidationPipe(createProductSchema))
    input: CreateProductInput,
  ) {
    return this.productService.create({
      title: input.title,
      categoryId: input.categoryId,
      userId: _user.id,
      price: input.price,
      address: input.address,
    });
  }

  @ResolveField(() => Category)
  async category(@Root() _product: Product) {
    return this.productService.findCategory(_product);
  }

  @ResolveField(() => User)
  async user(@Root() _product: Product) {
    return this.userService.findOne(_product.userId);
  }
}
