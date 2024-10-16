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
import { swedishPhoneNumberRegex } from 'src/constants/regexp';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { RockerService } from 'src/services/rocker.service';
import { z } from 'zod';

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
  @Field(() => String)
  phoneNumber: string;
}
const createPayoutAccountSchema = z.object({
  phoneNumber: z.string().regex(swedishPhoneNumberRegex),
});

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

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createPayoutAccount(
    @Args('input', new ZodValidationPipe(createPayoutAccountSchema))
    input: CreatePayoutAccountInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.rockerService.createPayoutAccount(
      input.phoneNumber,
      _user.id,
    );
  }
}
