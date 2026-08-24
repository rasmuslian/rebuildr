import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  ID,
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
import { GoogleAnalyticsService } from 'src/services/google-analytics.service';
import { StatisticsInsightsService } from 'src/services/statistics/statistics-insights.service';
import { StatisticsService } from 'src/services/statistics.service';

export enum CmsProductStatisticsGroupByEnum {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}
registerEnumType(CmsProductStatisticsGroupByEnum, {
  name: 'CmsProductStatisticsGroupByEnum',
});

//Shared base for endpoints that take an optional Stockholm-local day range.
@InputType({ isAbstract: true })
export abstract class CmsStatisticsBaseInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;

  @Field(() => String, { nullable: true })
  from?: string;

  @Field(() => String, { nullable: true })
  to?: string;
}

//Shared base for endpoints that require the range.
@InputType({ isAbstract: true })
export abstract class CmsDateRangeInput {
  @Field(() => String)
  from: string;

  @Field(() => String)
  to: string;
}

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
export class CmsProductStatisticsInput extends CmsStatisticsBaseInput {}

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
export class CmsUserStatisticsInput extends CmsStatisticsBaseInput {}

@ObjectType()
export class CmsPurchaseStatisticsDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float, { nullable: true })
  gmvSek?: number;
}

@ObjectType()
export class CmsPurchaseStatisticsResponse {
  @Field(() => [CmsPurchaseStatisticsDataPoint])
  data: CmsPurchaseStatisticsDataPoint[];
}

@InputType()
export class CmsPurchaseStatisticsInput extends CmsStatisticsBaseInput {}

@ObjectType()
export class CmsCo2SavingsDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  co2Kg: number;
}

@ObjectType()
export class CmsCo2SavingsResponse {
  @Field(() => [CmsCo2SavingsDataPoint])
  data: CmsCo2SavingsDataPoint[];
}

@InputType()
export class CmsCo2SavingsInput extends CmsStatisticsBaseInput {}

@ObjectType()
export class CmsRepeatBuyerRateDataPoint {
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
export class CmsRepeatBuyerRateResponse {
  @Field(() => [CmsRepeatBuyerRateDataPoint])
  data: CmsRepeatBuyerRateDataPoint[];
}

@InputType()
export class CmsRepeatBuyerRateInput extends CmsStatisticsBaseInput {}

@ObjectType()
export class CmsPurchaseFailureRateDataPoint {
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
export class CmsPurchaseFailureRateResponse {
  @Field(() => [CmsPurchaseFailureRateDataPoint])
  data: CmsPurchaseFailureRateDataPoint[];
}

@InputType()
export class CmsPurchaseFailureRateInput extends CmsStatisticsBaseInput {}

@ObjectType()
export class CmsKpiValue {
  @Field(() => Float)
  value: number;

  @Field(() => Float, { nullable: true })
  previousValue?: number | null;

  //Null when the previous period had no data — the UI renders "–".
  @Field(() => Float, { nullable: true })
  changePercent?: number | null;
}

@InputType()
export class CmsKpiSummaryInput extends CmsDateRangeInput {}

@ObjectType()
export class CmsKpiSummaryResponse {
  @Field(() => CmsKpiValue)
  listingsPublished: CmsKpiValue;

  @Field(() => CmsKpiValue)
  salesCount: CmsKpiValue;

  @Field(() => CmsKpiValue)
  listingsSold: CmsKpiValue;

  @Field(() => CmsKpiValue)
  upcomingListingsCreated: CmsKpiValue;

  @Field(() => CmsKpiValue)
  activeUsers: CmsKpiValue;

  @Field(() => CmsKpiValue)
  newUsers: CmsKpiValue;

  @Field(() => CmsKpiValue)
  totalSalesSek: CmsKpiValue;

  @Field(() => CmsKpiValue)
  avgOrderValueSek: CmsKpiValue;

  @Field(() => CmsKpiValue)
  avgItemPriceSek: CmsKpiValue;

  @Field(() => CmsKpiValue)
  co2SavedKg: CmsKpiValue;

  @Field(() => CmsKpiValue)
  activeListingsNow: CmsKpiValue;

  @Field(() => CmsKpiValue)
  newBusinessUsers: CmsKpiValue;

  @Field(() => CmsKpiValue)
  messagesSent: CmsKpiValue;
}

@InputType()
export class CmsTopCategoriesInput extends CmsDateRangeInput {
  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class CmsTopCategoryEntry {
  @Field(() => ID)
  categoryId: string;

  @Field()
  categoryName: string;

  @Field(() => Float)
  salesSek: number;

  @Field(() => Int)
  salesCount: number;

  @Field(() => Int)
  listingCount: number;
}

@ObjectType()
export class CmsTopCategoriesResponse {
  @Field(() => [CmsTopCategoryEntry])
  bySales: CmsTopCategoryEntry[];

  @Field(() => [CmsTopCategoryEntry])
  byListings: CmsTopCategoryEntry[];
}

@InputType()
export class CmsTopProductsInput extends CmsDateRangeInput {
  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class CmsTopProductEntry {
  @Field(() => ID)
  productId: string;

  //Null when the product row is gone; the view events remain.
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Int)
  viewCount: number;
}

@InputType()
export class CmsTopSearchTermsInput extends CmsDateRangeInput {
  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class CmsTopSearchTermEntry {
  @Field()
  term: string;

  @Field(() => Int)
  count: number;
}

@InputType()
export class CmsTrafficStatsInput extends CmsDateRangeInput {}

@ObjectType()
export class CmsTrafficEntry {
  @Field()
  name: string;

  @Field(() => Int)
  sessions: number;
}

@ObjectType()
export class CmsTrafficStatsResponse {
  @Field(() => Int)
  sessions: number;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  pageViews: number;

  @Field(() => [CmsTrafficEntry])
  topSources: CmsTrafficEntry[];

  @Field(() => [CmsTrafficEntry])
  topLandingPages: CmsTrafficEntry[];

  //Web visitors located in Sweden, ordered by sessions.
  @Field(() => [CmsTrafficEntry])
  topCities: CmsTrafficEntry[];
}

@ObjectType()
export class CmsUsersByCityEntry {
  @Field()
  city: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsUsersByCityResponse {
  @Field(() => [CmsUsersByCityEntry])
  cities: CmsUsersByCityEntry[];

  //Registered users with no city recorded, so the table's coverage is honest.
  @Field(() => Int)
  unknownCount: number;
}

@InputType()
export class CmsTimeToSellInput extends CmsDateRangeInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;

  @Field(() => ID, { nullable: true })
  categoryId?: string;
}

@ObjectType()
export class CmsTimeToSellDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  medianDays: number;

  @Field(() => Float)
  p25Days: number;

  @Field(() => Float)
  p75Days: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsTimeToSellResponse {
  @Field(() => [CmsTimeToSellDataPoint])
  data: CmsTimeToSellDataPoint[];
}

@InputType()
export class CmsPurchaseBreakdownsInput extends CmsDateRangeInput {}

@ObjectType()
export class CmsBreakdownEntry {
  //Enum value, or "UNKNOWN" for purchases with no method recorded.
  @Field()
  method: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  gmvSek: number;
}

@ObjectType()
export class CmsPurchaseBreakdownsResponse {
  @Field(() => [CmsBreakdownEntry])
  transport: CmsBreakdownEntry[];

  @Field(() => [CmsBreakdownEntry])
  payment: CmsBreakdownEntry[];
}

@InputType()
export class CmsReviewStatsInput extends CmsDateRangeInput {
  @Field(() => CmsProductStatisticsGroupByEnum, { nullable: true })
  groupBy?: CmsProductStatisticsGroupByEnum;
}

@ObjectType()
export class CmsReviewDistributionEntry {
  @Field(() => Int)
  stars: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsReviewSeriesPoint {
  @Field()
  date: string;

  @Field(() => Float)
  avgStars: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsReviewStatsResponse {
  @Field(() => Float)
  average: number;

  @Field(() => Int)
  count: number;

  @Field(() => [CmsReviewDistributionEntry])
  distribution: CmsReviewDistributionEntry[];

  @Field(() => [CmsReviewSeriesPoint])
  series: CmsReviewSeriesPoint[];
}

@InputType()
export class CmsPriceDistributionInput extends CmsDateRangeInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  condition?: string;
}

@ObjectType()
export class CmsPriceBucket {
  @Field(() => Float)
  fromSek: number;

  //Null on the last bucket, which is open-ended.
  @Field(() => Float, { nullable: true })
  toSek?: number | null;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CmsPriceDistributionResponse {
  @Field(() => [CmsPriceBucket])
  buckets: CmsPriceBucket[];
}

@Resolver()
export class StatisticsResolver {
  constructor(
    private statisticsService: StatisticsService,
    private statisticsInsightsService: StatisticsInsightsService,
    private googleAnalyticsService: GoogleAnalyticsService,
  ) {}

  @Query(() => CmsTimeToSellResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTimeToSell(
    @Args('input') input: CmsTimeToSellInput,
  ): Promise<CmsTimeToSellResponse> {
    return this.statisticsInsightsService.cmsTimeToSell(input);
  }

  @Query(() => CmsPurchaseBreakdownsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPurchaseBreakdowns(
    @Args('input') input: CmsPurchaseBreakdownsInput,
  ): Promise<CmsPurchaseBreakdownsResponse> {
    return this.statisticsInsightsService.cmsPurchaseBreakdowns(input);
  }

  @Query(() => CmsReviewStatsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsReviewStats(
    @Args('input') input: CmsReviewStatsInput,
  ): Promise<CmsReviewStatsResponse> {
    return this.statisticsInsightsService.cmsReviewStats(input);
  }

  @Query(() => CmsPriceDistributionResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPriceDistribution(
    @Args('input') input: CmsPriceDistributionInput,
  ): Promise<CmsPriceDistributionResponse> {
    return this.statisticsInsightsService.cmsPriceDistribution(input);
  }

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

  @Query(() => CmsCo2SavingsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCo2SavingsStatistics(
    @Args('input', { nullable: true }) input?: CmsCo2SavingsInput,
  ): Promise<CmsCo2SavingsResponse> {
    return this.statisticsService.cmsCo2SavingsStatistics(input ?? {});
  }

  @Query(() => CmsRepeatBuyerRateResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsRepeatBuyerRateStatistics(
    @Args('input', { nullable: true }) input?: CmsRepeatBuyerRateInput,
  ): Promise<CmsRepeatBuyerRateResponse> {
    return this.statisticsService.cmsRepeatBuyerRateStatistics(input ?? {});
  }

  @Query(() => CmsPurchaseFailureRateResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPurchaseFailureRateStatistics(
    @Args('input', { nullable: true }) input?: CmsPurchaseFailureRateInput,
  ): Promise<CmsPurchaseFailureRateResponse> {
    return this.statisticsService.cmsPurchaseFailureRateStatistics(input ?? {});
  }

  @Query(() => CmsKpiSummaryResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsKpiSummary(
    @Args('input') input: CmsKpiSummaryInput,
  ): Promise<CmsKpiSummaryResponse> {
    return this.statisticsService.cmsKpiSummary(input);
  }

  @Query(() => CmsTopCategoriesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTopCategories(
    @Args('input') input: CmsTopCategoriesInput,
  ): Promise<CmsTopCategoriesResponse> {
    return this.statisticsService.cmsTopCategories(input);
  }

  @Query(() => [CmsTopProductEntry])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTopProducts(
    @Args('input') input: CmsTopProductsInput,
  ): Promise<CmsTopProductEntry[]> {
    return this.statisticsService.cmsTopProducts(input);
  }

  @Query(() => [CmsTopSearchTermEntry])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTopSearchTerms(
    @Args('input') input: CmsTopSearchTermsInput,
  ): Promise<CmsTopSearchTermEntry[]> {
    return this.statisticsService.cmsTopSearchTerms(input);
  }

  //All-time snapshot of where registered users are located (all platforms),
  //independent of Google Analytics and cookie consent.
  @Query(() => CmsUsersByCityResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUsersByCity(): Promise<CmsUsersByCityResponse> {
    return this.statisticsService.cmsUsersByCity();
  }

  //Nullable by design: null (GA not configured or API error) hides the
  //dashboard section instead of failing the page.
  @Query(() => CmsTrafficStatsResponse, { nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTrafficStats(
    @Args('input') input: CmsTrafficStatsInput,
  ): Promise<CmsTrafficStatsResponse | null> {
    return this.googleAnalyticsService.getTrafficStats(input.from, input.to);
  }
}
