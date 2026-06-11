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
import { AuthedUserType, authThrottleConfig } from 'src/auth/constants';
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
import { Throttle } from '@nestjs/throttler';
import { UserService } from 'src/services/user.service';
import { File } from 'src/entities/file.entity';
import { LocationResponse } from './geocoding.resolver';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { ForbiddenException } from 'src/exceptions';
import { Review } from 'src/entities/review.entity';
import { ProductsResponse } from './product.resolver';
import { ProductService } from 'src/services/product.service';
import { ProjectService } from 'src/services/project.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { MailchimpService } from 'src/services/mailchimp.service';
import { FileInputType } from './file.resolver';
import { SellerAccountCapabilityEnum } from 'src/services/stripe.service';

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

  @Field({ nullable: true })
  websiteUrl?: string;
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

@ObjectType()
export class OrganizationLookupResponse {
  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  zipCode: string;

  @Field(() => String)
  city: string;

  @Field(() => Boolean)
  alreadyRegistered: boolean;
}

@ObjectType()
class UserExistsResponse {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => RegistrationStatusEnum, { nullable: true })
  registrationStatus?: RegistrationStatusEnum;
}

@InputType()
export class SignupNewsLetterInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
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

@InputType()
export class OnboardSellerAccountInput {
  @Field(() => SellerAccountCapabilityEnum)
  capability: SellerAccountCapabilityEnum;
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

  @Field({ nullable: true })
  canSell?: boolean;

  @Field({ nullable: true })
  pendingApproval?: boolean;
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

  @Field({ nullable: true })
  isFeatured?: boolean;

  @Field({ nullable: true })
  websiteUrl?: string;
}

@ObjectType()
export class SellerAccount {
  id: string;
  @Field(() => Boolean)
  canReceivePayment: boolean;
  @Field(() => Boolean)
  canReceivePayout: boolean;
}
@Resolver(() => User)
export class UserResolver {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private projectService: ProjectService,
    private mailchimpService: MailchimpService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() _user: AuthedUserType) {
    return await this.userService.findOne(_user.id);
  }

  @Query(() => UserExistsResponse)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  async userExists(@Args('input') input: UserExistsInput) {
    return this.userService.userExists(input.email);
  }

  @Query(() => OrganizationLookupResponse, { nullable: true })
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  async lookupOrganizationNumber(@Args('orgNumber') orgNumber: string) {
    return this.userService.lookupOrganizationNumber(orgNumber);
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

  @Query(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsGetUser(@Args('id') id: string): Promise<User> {
    return this.userService.cmsGetUser(id);
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
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async approveBusinessAccount(@Args('userId') userId: string) {
    return this.userService.approveBusinessAccount(userId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async deleteAccount(@CurrentUser() user: AuthedUserType) {
    return await this.userService.delete(user.id, user.id);
  }

  @Mutation(() => OnboardSellerAccountResponse)
  @UseGuards(GqlAuthGuard)
  async onboardSellerAccount(
    @Args('input') input: OnboardSellerAccountInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.userService.onboardSellerAccount(input, user.id);
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
  async signupNewsLetter(@Args('input') input: SignupNewsLetterInput) {
    return await this.mailchimpService.addSubscriberToNewsletterList(
      input.email,
      input.firstName,
      input.lastName,
    );
  }

  @Mutation(() => SellerAccount)
  @UseGuards(GqlAuthGuard)
  async createSellerAccount(@CurrentUser() user: AuthedUserType) {
    return await this.userService.createSellerAccount(user.id);
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

  @ResolveField(() => Number)
  async totalCO2Savings(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    const [buyer, seller] = await Promise.all([
      userLoaders.totalCO2SavingsBuyer.load(user.id),
      userLoaders.totalCO2SavingsSeller.load(user.id),
    ]);
    return buyer + seller;
  }

  @ResolveField(() => Number)
  async totalCO2SavingsBuyer(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.totalCO2SavingsBuyer.load(user.id);
  }

  @ResolveField(() => Number)
  async totalCO2SavingsSeller(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.totalCO2SavingsSeller.load(user.id);
  }

  @ResolveField(() => Int)
  async numberOfCompletedPurchases(
    @Parent() user: User,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ): Promise<number> {
    return await userLoaders.numberOfCompletedPurchases.load(user.id);
  }

  @ResolveField(() => SellerAccount, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async sellerAccount(
    @Parent() user: User,
    @CurrentUser() currentUser: AuthedUserType,
  ) {
    return await this.userService.getSellerAccount(user, currentUser.id);
  }
}
