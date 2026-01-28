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
  ResolveField,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Project } from 'src/entities/project.entity';
import {
  RegistrationStatusEnum,
  User,
  UserRoleEnum,
  UserType,
} from 'src/entities/user.entity';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { UserService } from 'src/services/user.service';
import { File } from 'src/entities/file.entity';
import { LocationResponse } from './geocoding.resolver';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { ForbiddenException } from 'src/exceptions';
import { Review } from 'src/entities/review.entity';
import { FileInputType, ProductsResponse } from './product.resolver';
import { ProductService } from 'src/services/product.service';
import { ProjectService } from 'src/services/project.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { MailchimpService } from 'src/services/mailchimp.service';

export enum ProductsRecommendationSourceEnum {
  LIKES = 'LIKES',
  SEARCH_HISTORY = 'SEARCH_HISTORY',
}
registerEnumType(ProductsRecommendationSourceEnum, {
  name: 'ProductsRecommendationSourceEnum',
});

export enum OrderUsersEnum {
  ALPHABETICAL = 'ALPHABETICAL',
}
registerEnumType(OrderUsersEnum, { name: 'OrderUsersEnum' });

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
  notifyOnPurchaseUpdate?: boolean;
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
}
@InputType()
export class UpdateOrganizationUserInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  organizationName?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  postCode?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  phoneNumber?: string;
}

@InputType()
export class GetUserInput {
  @Field()
  id: string;
}

@InputType()
export class UsersInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Boolean, { nullable: true })
  hasProject?: boolean;

  @Field(() => UserType, { nullable: true })
  type?: UserType;

  @Field(() => Boolean, { nullable: true })
  isPromoted?: boolean;

  @Field(() => OrderUsersEnum, { nullable: true })
  orderBy?: OrderUsersEnum;
}

@ObjectType()
export class UsersResponse {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class PayoutAccount {
  @Field(() => String)
  type: string;

  @Field({ nullable: true })
  routingNumber?: string;

  @Field({ nullable: true })
  last4?: string;

  @Field({ nullable: true })
  bankName?: string;
}

@InputType()
export class RecommendedProductsInput {
  @Field(() => ProductsRecommendationSourceEnum)
  recommendationSource: ProductsRecommendationSourceEnum;

  @Field({ nullable: true })
  excludeOwnProducts?: boolean;
}

@ObjectType()
export class OnboardSellerAccountResponse {
  @Field(() => User)
  user: User;

  @Field()
  clientSecret: string;

  @Field(() => [String])
  fields: string[];
}

@InputType()
export class CmsListUsersInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  searchString?: string;
}

@ObjectType()
export class CmsListUsersResponse {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;
}
@InputType()
export class CmsUpdateUsersInput {
  @Field(() => String, { nullable: false })
  id: string;

  @Field(() => UserRoleEnum, { nullable: false })
  role: UserRoleEnum;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  postCode?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;
}
@Resolver(() => User)
export class UserResolver {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private productService: ProductService,
    private projectService: ProjectService,
    private mailchimpService: MailchimpService,
  ) {}

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

  @Query(() => UsersResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async users(
    @Args('input') input: UsersInput,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ) {
    return this.userService.getUsers(input, limit, offset);
  }

  @Query(() => CmsListUsersResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListUsers(
    @Args('input') input: CmsListUsersInput,
  ): Promise<CmsListUsersResponse> {
    return this.userService.cmsListUsers(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateUser(
    @Args('input') input: CmsUpdateUsersInput,
  ): Promise<User> {
    return this.userService.cmsUpdateUser(input);
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
    @CurrentUser() user: AuthedUserType,
  ): Promise<User> {
    return await this.userService.createOrganizationUser(input, user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateOrganizationUser(
    @Args('input') input: UpdateOrganizationUserInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.userService.updateOrganizationUser(input, user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async deleteAccount(@CurrentUser() user: AuthedUserType) {
    return await this.userService.delete(user.id, user.id);
  }

  @Mutation(() => OnboardSellerAccountResponse)
  @UseGuards(GqlAuthGuard)
  async onboardSellerAccount(@CurrentUser() user: AuthedUserType) {
    return await this.userService.onboardSellerAccount(user.id);
  }
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async addPayoutAccount(
    @CurrentUser() user: AuthedUserType,
    @Args('token') token: string,
  ) {
    return await this.userService.addPayoutAccount(user.id, token);
  }

  @Mutation(() => Boolean)
  async signupNewsLetter(@Args('email') email: string) {
    return await this.mailchimpService.addSubscriberToNewsletterList(email);
  }

  @ResolveField(() => Boolean)
  async sellerAccountIsCreated(@Parent() user: User) {
    return await this.userService.sellerAccountIsCreated(user);
  }
  @ResolveField(() => Boolean)
  async sellerAccountIsEnabled(@Parent() user: User) {
    return await this.userService.sellerAccountIsEnabled(user);
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
    return await userLoaders.productsLoader.load(user.id);
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

  @ResolveField(() => ProductsResponse, { nullable: true })
  async likedProducts(
    @Parent() user: User,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ) {
    return this.productService.findAll(
      { likedByUserIds: [user.id] },
      limit,
      offset,
    );
  }

  @ResolveField(() => [Project], { nullable: true })
  async likedProjects(@Parent() user: User) {
    return this.projectService.findMany({ likedByUserIds: [user.id] });
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

  @ResolveField(() => PayoutAccount, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async payoutAccount(@Parent() user: User) {
    return await this.userService.getPayoutAccount(user.id);
  }

  @ResolveField(() => [Product])
  @UseGuards(GqlAuthGuard)
  async recommendedProducts(
    @Parent() user: User,
    @Args('input') input: RecommendedProductsInput,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
  ) {
    return await this.productService.recommendedProducts(
      user.id,
      input,
      limit,
      offset,
    );
  }

  @ResolveField(() => User, { nullable: true })
  async organizationAccount(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    const organizations = await userLoaders.getOrganizations.load(user.id);
    return organizations?.[0];
  }

  @ResolveField(() => User, { nullable: true })
  async organizationOwner(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    const owners = await userLoaders.getOrganizationOwners.load(user.id);
    return owners?.[0];
  }
}
