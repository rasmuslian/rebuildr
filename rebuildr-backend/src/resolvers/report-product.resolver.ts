import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import {
  ReportProduct,
  ReportProductTypeEnum,
} from 'src/entities/report-product.entity';
import { ReportProductService } from 'src/services/report-product.service';

@InputType()
export class CreateReportProductInput {
  @Field()
  productId: string;

  @Field(() => ReportProductTypeEnum)
  type: ReportProductTypeEnum;

  @Field()
  message: string;
}

@Resolver(() => ReportProduct)
export class ReportProductResolver {
  constructor(private reportProductService: ReportProductService) {}

  @Mutation(() => ReportProduct)
  @UseGuards(GqlAuthGuard)
  async createReportProduct(
    @Args('input') input: CreateReportProductInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.reportProductService.createReportProduct(input, user.id);
  }
}
