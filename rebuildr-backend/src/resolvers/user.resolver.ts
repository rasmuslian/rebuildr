import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { UserService } from 'src/services/user.service';

@InputType()
class UpdateUserInput {
  @Field()
  id: string;

  @Field(() => String)
  address: string;
}
@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() _user: AuthedUserType) {
    return this.userService.findOne(_user.id);
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
}
