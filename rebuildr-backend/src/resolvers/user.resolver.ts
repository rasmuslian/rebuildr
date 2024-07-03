import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@InputType()
class UpdateUserInput {
  @Field(() => String)
  address: string;
}
@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() _user: User) {
    return this.userService.findOne(_user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @CurrentUser() _user: User,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.update({ id: _user.id, address: input.address });
  }
}
