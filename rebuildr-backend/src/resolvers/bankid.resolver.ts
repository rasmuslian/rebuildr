import {
  Args,
  Context,
  Field,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType } from 'src/auth/constants';
import { UserRoleEnum } from 'src/entities/user.entity';
import {
  BankIDService,
  BankIDVerifyStatusEnum,
} from 'src/services/bankid.service';
import { Request } from 'express';

export { BankIDVerifyStatusEnum };
registerEnumType(BankIDVerifyStatusEnum, { name: 'BankIDVerifyStatus' });

@ObjectType()
export class InitBankIDVerifyResponse {
  @Field()
  orderRef: string;

  @Field()
  autoStartToken: string;
}

@ObjectType()
export class CollectBankIDVerifyResponse {
  @Field(() => BankIDVerifyStatusEnum)
  status: BankIDVerifyStatusEnum;

  @Field(() => String, { nullable: true })
  qrData: string | null;
}

@Resolver()
export class BankIDResolver {
  constructor(private readonly bankIDService: BankIDService) {}

  @Mutation(() => InitBankIDVerifyResponse)
  @UseGuards(GqlAuthGuard)
  async initBankIDVerify(
    @Context('req') req: Request,
  ): Promise<InitBankIDVerifyResponse> {
    return this.bankIDService.initVerify(
      req.ip ?? req.socket.remoteAddress ?? '',
    );
  }

  @Query(() => CollectBankIDVerifyResponse)
  @UseGuards(GqlAuthGuard)
  async collectBankIDVerify(
    @Args('orderRef') orderRef: string,
    @CurrentUser() user: AuthedUserType,
  ): Promise<CollectBankIDVerifyResponse> {
    return this.bankIDService.collectVerify(orderRef, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async resetUserIdentity(@Args('userId') userId: string): Promise<boolean> {
    if (process.env.ADMIN_ENV !== 'staging') {
      throw new ForbiddenException('Only available on staging');
    }
    return this.bankIDService.resetIdentity(userId);
  }
}
