import { Injectable, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
} from '@nestjs/graphql';
import { AuthResponseStatusEnum } from 'src/apis/types/rockerTypes';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
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

@ObjectType()
class PlaceholderResponse {
  @Field()
  message: string;
}

@Injectable()
export class RockerResolver {
  constructor(private rockerService: RockerService) {}

  //Tests need this to work. In an app there must exist atleast one Query() among all resolvers.
  //This requirement is not met by signup.e2e-spec.ts which only uses this resolver.
  @Query(() => PlaceholderResponse)
  async placeholderQuery() {
    console.log('This query is a placeholder');
    return { message: 'Returning placeholder' };
  }

  @Mutation(() => AuthenticateResponse)
  @UseGuards(GqlAuthGuard)
  async authenticateRocker(
    @Args('input') input: AuthenticateRockerInput,
    @CurrentUser() _user: AuthedUserType,
  ) {
    return await this.rockerService.authenticate(input.requestId, _user.id);
  }
}
