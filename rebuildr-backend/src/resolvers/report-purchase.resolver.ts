import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import {
  ReportPurchase,
  ReportPurchaseTypeEnum,
} from 'src/entities/report-purchase.entity';
import { ReportPurchaseService } from 'src/services/report-purchase.service';

@InputType()
export class CreateReportPurchaseInput {
  @Field()
  purchaseId: string;

  @Field(() => ReportPurchaseTypeEnum)
  type: ReportPurchaseTypeEnum;

  @Field()
  message: string;
}

@Resolver(() => ReportPurchase)
export class ReportPurchaseResolver {
  constructor(private reportPurchaseService: ReportPurchaseService) {}

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
}
