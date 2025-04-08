import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { RegistrationStatusEnum, User } from 'src/entities/user.entity';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { UserService } from 'src/services/user.service';

@InputType()
export class UpdateUserInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;
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

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlThrottlerGuard)
  async updateUser(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.update(
      { id: input.id, address: input.address },
      _user.id,
    );
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createOrganizationUser(
    @Args('input') input: CreateOrganizationUserInput,
  ): Promise<User> {
    return await this.userService.createOrganizationUser(input);
  }

  @ResolveField(() => RegistrationStatusEnum)
  async registrationStatus(@Parent() user: User) {
    return await this.userService.getRegistrationStatus(user);
  }
}
