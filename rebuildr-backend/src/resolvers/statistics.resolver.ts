import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
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
}
