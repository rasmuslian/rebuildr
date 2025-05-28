import { UseGuards } from '@nestjs/common';
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
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Project } from 'src/entities/project.entity';
import {
  PayoutAccountEnum,
  RegistrationStatusEnum,
  User,
  UserRoleEnum,
} from 'src/entities/user.entity';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { UserService } from 'src/services/user.service';
import { File } from 'src/entities/file.entity';
import { LocationResponse } from './geocoding.resolver';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { ForbiddenException } from 'src/exceptions';
import { Review } from 'src/entities/review.entity';
import { FileInputType } from './product.resolver';

@InputType()
export class UpdateUserInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  postCode?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field(() => FileInputType, { nullable: true })
  profilePicture?: FileInputType;

  @Field({ nullable: true })
  notifyOnMessage?: boolean;
  @Field({ nullable: true })
  notifyOnBuy?: boolean;
  @Field({ nullable: true })
  notifyOnSale?: boolean;
}

@ObjectType()
export class UpdateUserResponse {
  @Field(() => User)
  user: User;

  @Field(() => String, { nullable: true })
  profilePicturePutUrl: string;
}

@InputType()
class UserExistsInput {
  @Field()
  email: string;
}

@InputType()
export class CreateOrganizationUserInput {
  @Field(() => String)
  organizationNumber: string;

  @Field(() => String)
  organizationName: string;

  @Field(() => String)
  creatorId: string;
}

@InputType()
export class GetUserInput {
  @Field()
  id: string;
}

@InputType()
export class GetUsersInput {
  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  pageSize?: number | null;
}

@ObjectType()
export class PayoutAccountResponse {
  @Field(() => PayoutAccountEnum)
  provider: PayoutAccountEnum;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  bankName?: string;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() _user: AuthedUserType) {
    return await this.userService.findOne(_user.id);
  }

  @Query(() => User, { nullable: true })
  async userExists(@Args('input') input: UserExistsInput) {
    return await this.userService.findOneByEmail(input.email);
  }

  @Query(() => User)
  async user(@Args('input') input: GetUserInput) {
    return await this.userService.findOne(input.id);
  }

  @Query(() => [User])
  @UseGuards(GqlOptionalAuthGuard)
  async getUsers(@Args('input') input: GetUsersInput): Promise<User[]> {
    return this.userService.getUsers(input);
  }

  @Mutation(() => UpdateUserResponse)
  @UseGuards(GqlAuthGuard, GqlThrottlerGuard)
  async updateUser(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.update(input, _user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createOrganizationUser(
    @Args('input') input: CreateOrganizationUserInput,
  ): Promise<User> {
    return await this.userService.createOrganizationUser(input);
  }

  @ResolveField(() => File, { nullable: true })
  async profilePicture(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.profilePictureLoader.load(user.id);
  }

  @ResolveField(() => RegistrationStatusEnum)
  async registrationStatus(@Parent() user: User) {
    return await this.userService.getRegistrationStatus(user);
  }

  @ResolveField(() => [Project])
  async projects(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.projectsLoader.load(user.id);
  }

  @ResolveField(() => Int)
  async numberOfSoldProducts(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ): Promise<number> {
    return (await userLoaders.soldProductsLoader.load(user.id)).length;
  }
  @ResolveField(() => Int)
  async numberOfPublishedProducts(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ): Promise<number> {
    return (await userLoaders.publishedProductsLoader.load(user.id)).length;
  }

  @ResolveField(() => [Product])
  async products(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.publishedProductsLoader.load(user.id);
  }

  @ResolveField(() => [Purchase])
  async purchases(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.purchasesLoader.load(user.id);
  }

  @ResolveField(() => [Purchase])
  @UseGuards(GqlAuthGuard)
  async sales(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
    @CurrentUser() currentUser: AuthedUserType,
  ) {
    if (user.id !== currentUser.id && currentUser.role !== UserRoleEnum.ADMIN) {
      throw ForbiddenException();
    }
    return await userLoaders.salesLoader.load(user.id);
  }

  @ResolveField(() => Number, { nullable: true })
  async rating(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.ratingLoader.load(user.id);
  }

  @ResolveField(() => [Product], { nullable: true })
  async likedProducts(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.likedProductsLoader.load(user.id);
  }

  @ResolveField(() => LocationResponse, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async location(
    @Parent() user: User,
    @CurrentUser() requester: AuthedUserType,
  ) {
    return this.userService.addressLocationToCoordinates(user, requester.id);
  }

  @ResolveField(() => [Review])
  async reviewed(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return userLoaders.reviewedLoader.load(user.id);
  }

  @ResolveField(() => PayoutAccountResponse, { nullable: true })
  async payoutAccount(@Parent() user: User) {
    return await this.userService.getPayoutAccount(user);
  }
}
