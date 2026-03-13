import { Inject, UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import {
  ReportPurchase,
  ReportPurchaseResolutionEnum,
  ReportPurchaseTypeEnum,
} from 'src/entities/report-purchase.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { ReportPurchaseService } from 'src/services/report-purchase.service';
import { Logger } from 'winston';

@InputType()
export class CreateReportPurchaseInput {
  @Field()
  purchaseId: string;

  @Field(() => ReportPurchaseTypeEnum)
  type: ReportPurchaseTypeEnum;

  @Field()
  message: string;
}

@InputType()
class CmsResolveReportPurchaseInput {
  @Field()
  reportPurchaseId: string;

  @Field(() => ReportPurchaseResolutionEnum)
  resolution: ReportPurchaseResolutionEnum;
}

@Resolver(() => ReportPurchase)
export class ReportPurchaseResolver {
  constructor(
    private reportPurchaseService: ReportPurchaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Mutation(() => ReportPurchase)
  @UseGuards(GqlAuthGuard)
  async createReportPurchase(
    @Args('input') input: CreateReportPurchaseInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.reportPurchaseService.createReportPurchase(
      input,
      user.id,
    );
  }

  @Mutation(() => ReportPurchase)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsResolveReportPurchase(
    @Args('input') input: CmsResolveReportPurchaseInput,
  ) {
    return await this.reportPurchaseService.resolveReport(
      input.resolution,
      input.reportPurchaseId,
      this.logger,
    );
  }
}
