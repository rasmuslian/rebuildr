import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { AuthResponseStatusEnum } from 'src/apis/types/rocker-types';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PayoutAccountEnum, User } from 'src/entities/user.entity';
import { RockerService } from 'src/services/rocker.service';

@InputType()
export class AuthenticateRockerInput {
  @Field()
  requestId: string;
}

@ObjectType()
export class AuthenticateResponse {
  @Field(() => AuthResponseStatusEnum)
  status: AuthResponseStatusEnum;

  @Field(() => String, { nullable: true })
  qrCode?: string;

  @Field(() => String, { nullable: true })
  autoStartToken?: string;
}

@InputType()
export class CreatePayoutAccountInput {
  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  clearingNumber?: string;

  @Field(() => String, { nullable: true })
  accountNumber?: string;

  @Field(() => String, { nullable: true })
  accountName?: string;

  @Field(() => String, { nullable: true })
  identifier?: string;

  @Field(() => String, { nullable: true })
  successUrl?: string;

  @Field(() => String, { nullable: true })
  failureUrl?: string;

  @Field(() => PayoutAccountEnum)
  type: PayoutAccountEnum;
}
@ObjectType()
export class CreatePayoutAccountResponse {
  @Field(() => User)
  user: User;

  @Field({ nullable: true })
  trustlyUrl?: string;
}

@InputType()
export class SelectPayoutMethodInput {
  @Field(() => PayoutAccountEnum)
  method: PayoutAccountEnum;
}
@Resolver()
export class RockerResolver {
  constructor(private rockerService: RockerService) {}

  @Mutation(() => AuthenticateResponse)
  @UseGuards(GqlAuthGuard)
  async authenticateRocker(
    @Args('input') input: AuthenticateRockerInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.rockerService.authenticate(input.requestId, _user.id);
  }

  @Mutation(() => CreatePayoutAccountResponse)
  @UseGuards(GqlAuthGuard)
  async createPayoutAccount(
    @Args('input')
    input: CreatePayoutAccountInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.rockerService.createPayoutAccount(input, _user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async selectPayoutMethod(
    @Args('input') input: SelectPayoutMethodInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.rockerService.setSelectedPayoutMethod(input, user.id);
  }
}
