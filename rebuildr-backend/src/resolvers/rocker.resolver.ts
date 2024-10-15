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
}
