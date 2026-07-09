import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { StatisticsService } from 'src/services/statistics.service';

export enum CmsProductStatisticsGroupByEnum {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}
registerEnumType(CmsProductStatisticsGroupByEnum, {
  name: 'CmsProductStatisticsGroupByEnum',
});

@ObjectType()
export class CmsProductStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsProductStatisticsResponse {
  @Field(() => [CmsProductStatisticsDataPoint])
  data: CmsProductStatisticsDataPoint[];
}

@InputType()
export class CmsProductStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsUserStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsUserStatisticsResponse {
  @Field(() => [CmsUserStatisticsDataPoint])
  data: CmsUserStatisticsDataPoint[];
}

@InputType()
export class CmsUserStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsPurchaseStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsPurchaseStatisticsResponse {
  @Field(() => [CmsPurchaseStatisticsDataPoint])
  data: CmsPurchaseStatisticsDataPoint[];
}

@InputType()
export class CmsPurchaseStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsRevenueStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class CmsRevenueStatisticsResponse {
  @Field(() => [CmsRevenueStatisticsDataPoint])
  data: CmsRevenueStatisticsDataPoint[];
}

@InputType()
export class CmsRevenueStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsAverageOrderValueStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  average: number;
}

@ObjectType()
export class CmsAverageOrderValueStatisticsResponse {
  @Field(() => [CmsAverageOrderValueStatisticsDataPoint])
  data: CmsAverageOrderValueStatisticsDataPoint[];
}

@InputType()
export class CmsAverageOrderValueStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsActiveListingsByCategoryDataPoint {
  @Field()
  category: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsActiveListingsByCategoryResponse {
  @Field(() => [CmsActiveListingsByCategoryDataPoint])
  data: CmsActiveListingsByCategoryDataPoint[];
}

@ObjectType()
export class CmsCo2SavingsStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class CmsCo2SavingsStatisticsResponse {
  @Field(() => [CmsCo2SavingsStatisticsDataPoint])
  data: CmsCo2SavingsStatisticsDataPoint[];
}

@InputType()
export class CmsCo2SavingsStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsRepeatBuyerRateStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  repeat: number;

  @Field(() => Float)
  percent: number;
}

@ObjectType()
export class CmsRepeatBuyerRateStatisticsResponse {
  @Field(() => [CmsRepeatBuyerRateStatisticsDataPoint])
  data: CmsRepeatBuyerRateStatisticsDataPoint[];
}

@InputType()
export class CmsRepeatBuyerRateStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsPurchaseFailureRateStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Float)
  percent: number;
}

@ObjectType()
export class CmsPurchaseFailureRateStatisticsResponse {
  @Field(() => [CmsPurchaseFailureRateStatisticsDataPoint])
  data: CmsPurchaseFailureRateStatisticsDataPoint[];
}

@InputType()
export class CmsPurchaseFailureRateStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsAverageTimeToPublishStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  averageDays: number;
}

@ObjectType()
export class CmsAverageTimeToPublishStatisticsResponse {
  @Field(() => [CmsAverageTimeToPublishStatisticsDataPoint])
  data: CmsAverageTimeToPublishStatisticsDataPoint[];
}

@InputType()
export class CmsAverageTimeToPublishStatisticsInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@Resolver()
export class StatisticsResolver {
  constructor(private statisticsService: StatisticsService) {}

  @Query(() => CmsProductStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsProductStatistics(
    @Args('input', { nullable: true }) input?: CmsProductStatisticsInput,
  ): Promise<CmsProductStatisticsResponse> {
    return this.statisticsService.cmsProductStatistics(input ?? {});
  }

  @Query(() => CmsUserStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUserStatistics(
    @Args('input', { nullable: true }) input?: CmsUserStatisticsInput,
  ): Promise<CmsUserStatisticsResponse> {
    return this.statisticsService.cmsUserStatistics(input ?? {});
  }

  @Query(() => CmsPurchaseStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPurchaseStatistics(
    @Args('input', { nullable: true }) input?: CmsPurchaseStatisticsInput,
  ): Promise<CmsPurchaseStatisticsResponse> {
    return this.statisticsService.cmsPurchaseStatistics(input ?? {});
  }

  @Query(() => CmsRevenueStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsRevenueStatistics(
    @Args('input', { nullable: true }) input?: CmsRevenueStatisticsInput,
  ): Promise<CmsRevenueStatisticsResponse> {
    return this.statisticsService.cmsRevenueStatistics(input ?? {});
  }

  @Query(() => CmsAverageOrderValueStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsAverageOrderValueStatistics(
    @Args('input', { nullable: true })
    input?: CmsAverageOrderValueStatisticsInput,
  ): Promise<CmsAverageOrderValueStatisticsResponse> {
    return this.statisticsService.cmsAverageOrderValueStatistics(input ?? {});
  }

  @Query(() => CmsActiveListingsByCategoryResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsActiveListingsByCategoryStatistics(): Promise<CmsActiveListingsByCategoryResponse> {
    return this.statisticsService.cmsActiveListingsByCategoryStatistics();
  }

  @Query(() => CmsCo2SavingsStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCo2SavingsStatistics(
    @Args('input', { nullable: true }) input?: CmsCo2SavingsStatisticsInput,
  ): Promise<CmsCo2SavingsStatisticsResponse> {
    return this.statisticsService.cmsCo2SavingsStatistics(input ?? {});
  }

  @Query(() => CmsRepeatBuyerRateStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsRepeatBuyerRateStatistics(
    @Args('input', { nullable: true })
    input?: CmsRepeatBuyerRateStatisticsInput,
  ): Promise<CmsRepeatBuyerRateStatisticsResponse> {
    return this.statisticsService.cmsRepeatBuyerRateStatistics(input ?? {});
  }

  @Query(() => CmsPurchaseFailureRateStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPurchaseFailureRateStatistics(
    @Args('input', { nullable: true })
    input?: CmsPurchaseFailureRateStatisticsInput,
  ): Promise<CmsPurchaseFailureRateStatisticsResponse> {
    return this.statisticsService.cmsPurchaseFailureRateStatistics(input ?? {});
  }

  @Query(() => CmsAverageTimeToPublishStatisticsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsAverageTimeToPublishStatistics(
    @Args('input', { nullable: true })
    input?: CmsAverageTimeToPublishStatisticsInput,
  ): Promise<CmsAverageTimeToPublishStatisticsResponse> {
    return this.statisticsService.cmsAverageTimeToPublishStatistics(
      input ?? {},
    );
  }
}
