import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  InputType,
  Mutation,
  ObjectType,
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
import { File } from 'src/entities/file.entity';
import { ZodValidationPipe } from 'src/pipes/zodValidationPipe';
import { CategoryService } from 'src/services/category.service';
import { FileService } from 'src/services/file.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import z from 'zod';
import { GqlOptionalAuthGuard } from 'src/auth/gqlOptionalAuth.guard';

@InputType()
export class FileInputType {
  @Field(() => String)
  mimeType: string;
}
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

  @Field(() => [FileInputType], { nullable: true })
  images?: FileInputType[];

  @Field(() => Boolean, { nullable: true })
  isGiveaway?: boolean;
}
const createProductSchema = z.object({
  title: z.string(),
  categoryId: z.string(),
  price: z.number(),
  address: z.string(),
  images: z.array(z.object({ mimeType: z.string() })).nullable(),
  isGiveaway: z.boolean().nullable(),
});
@ObjectType()
export class CreateProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => [String])
  presignedPutUrls: string[];
}

@InputType()
class ProductsInput {
  @Field({ nullable: true })
  searchString?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  distance?: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  selectionCategories?: boolean;

  @Field({ nullable: true })
  seasonalCategories?: boolean;
}

@InputType()
export class GetProductInput {
  @Field()
  id: string;
}

@InputType()
export class DeleteProductInput {
  @Field()
  id: string;
}

@ObjectType()
export class DeleteProductResponse {
  @Field()
  title: string;
}

@InputType()
export class HideProductInput {
  @Field()
  id: string;

  @Field()
  reason: string;
}

@InputType()
class ShowProductInput {
  @Field()
  id: string;
}
@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private userService: UserService,
    private categoryService: CategoryService,
    private fileService: FileService,
  ) {}

  @Query(() => Product)
  async product(@Args('input') input: GetProductInput) {
    return this.productService.findOne(input.id);
  }

  @Query(() => [Product])
  @UseGuards(GqlOptionalAuthGuard)
  async products(
    @Args('input') input: ProductsInput,
    @CurrentUser() user?: User,
  ) {
    return this.productService.findAll({ ...input }, user);
  }

  @Mutation(() => CreateProductResponse)
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
      images: input.images,
      isGiveaway: input.isGiveaway,
    });
  }

  @Mutation(() => DeleteProductResponse)
  @UseGuards(GqlAuthGuard)
  async deleteProduct(
    @CurrentUser() _user: User,
    @Args('input') input: DeleteProductInput,
  ) {
    return this.productService.delete(input.id, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async hideProduct(
    @CurrentUser() _user: User,
    @Args('input') input: HideProductInput,
  ) {
    return this.productService.hide(input.id, input.reason, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async showProduct(
    @CurrentUser() _user: User,
    @Args('input') input: ShowProductInput,
  ) {
    return this.productService.show(input.id, _user.id);
  }

  @ResolveField(() => Category)
  async category(@Root() _product: Product) {
    return this.categoryService.findOne(_product.categoryId);
  }

  @ResolveField(() => User)
  async user(@Root() _product: Product) {
    return this.userService.findOne(_product.userId);
  }

  @ResolveField(() => [File])
  async images(@Root() _product: Product) {
    return this.fileService.findByProduct(_product.id);
  }

  //TODO: fetch actual mainImage and not just the first image
  @ResolveField(() => File, { nullable: true })
  async mainImage(@Root() _product: Product) {
    return this.fileService.findOneByProduct(_product.id);
  }
}
