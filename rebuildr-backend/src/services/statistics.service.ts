import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import {
  CmsActiveListingsByCategoryResponse,
  CmsAverageOrderValueStatisticsInput,
  CmsAverageOrderValueStatisticsResponse,
  CmsAverageTimeToPublishStatisticsInput,
  CmsAverageTimeToPublishStatisticsResponse,
  CmsCo2SavingsStatisticsInput,
  CmsCo2SavingsStatisticsResponse,
  CmsProductStatisticsGroupByEnum,
  CmsProductStatisticsInput,
  CmsProductStatisticsResponse,
  CmsPurchaseFailureRateStatisticsInput,
  CmsPurchaseFailureRateStatisticsResponse,
  CmsPurchaseStatisticsInput,
  CmsPurchaseStatisticsResponse,
  CmsRepeatBuyerRateStatisticsInput,
  CmsRepeatBuyerRateStatisticsResponse,
  CmsRevenueStatisticsInput,
  CmsRevenueStatisticsResponse,
  CmsUserStatisticsInput,
  CmsUserStatisticsResponse,
} from 'src/resolvers/statistics.resolver';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  private truncExpr(
    groupBy: CmsProductStatisticsGroupByEnum,
    column: string,
  ): string {
    return `DATE_TRUNC('${groupBy.toLowerCase()}', ${column})`;
  }

  private toDataPoints(
    rows: { date: string; count: string }[],
  ): { date: string; count: number }[] {
    return rows.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      count: parseInt(row.count, 10),
    }));
  }

  async cmsProductStatistics(
    input: CmsProductStatisticsInput,
  ): Promise<CmsProductStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."createdAt"');
    const rows: { date: string; count: string }[] = await this.productRepository
      .createQueryBuilder('p')
      .select(expr, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('p.status != :status', { status: ProductStatus.DRAFT })
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany();
    return { data: this.toDataPoints(rows) };
  }

  async cmsUserStatistics(
    input: CmsUserStatisticsInput,
  ): Promise<CmsUserStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'u."createdAt"');
    const rows: { date: string; count: string }[] = await this.userRepository
      .createQueryBuilder('u')
      .select(expr, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u."deletedAt" IS NULL')
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany();
    return { data: this.toDataPoints(rows) };
  }

  async cmsPurchaseStatistics(
    input: CmsPurchaseStatisticsInput,
  ): Promise<CmsPurchaseStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."paymentAcceptedAt"');
    const rows: { date: string; count: string }[] =
      await this.purchaseRepository
        .createQueryBuilder('p')
        .select(expr, 'date')
        .addSelect('COUNT(*)', 'count')
        .where('p."paymentAcceptedAt" IS NOT NULL')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return { data: this.toDataPoints(rows) };
  }

  async cmsRevenueStatistics(
    input: CmsRevenueStatisticsInput,
  ): Promise<CmsRevenueStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."paymentAcceptedAt"');
    const rows: { date: string; total: string }[] =
      await this.purchaseRepository
        .createQueryBuilder('p')
        .innerJoin('p.product', 'prod')
        .select(expr, 'date')
        .addSelect(
          'SUM(prod.price * COALESCE(p."purchasedQuantity", 1))',
          'total',
        )
        .where('p."paymentAcceptedAt" IS NOT NULL')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        total: parseFloat(row.total) / 100,
      })),
    };
  }

  async cmsAverageOrderValueStatistics(
    input: CmsAverageOrderValueStatisticsInput,
  ): Promise<CmsAverageOrderValueStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."paymentAcceptedAt"');
    const rows: { date: string; average: string }[] =
      await this.purchaseRepository
        .createQueryBuilder('p')
        .innerJoin('p.product', 'prod')
        .select(expr, 'date')
        .addSelect(
          'AVG(prod.price * COALESCE(p."purchasedQuantity", 1))',
          'average',
        )
        .where('p."paymentAcceptedAt" IS NOT NULL')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        average: parseFloat(row.average) / 100,
      })),
    };
  }

  async cmsActiveListingsByCategoryStatistics(): Promise<CmsActiveListingsByCategoryResponse> {
    const rows: { category: string; count: string }[] =
      await this.productRepository
        .createQueryBuilder('p')
        .leftJoin('p.category', 'c')
        .select("COALESCE(c.name, 'Okategoriserad')", 'category')
        .addSelect('COUNT(*)', 'count')
        .where('p.status = :status', { status: ProductStatus.PUBLISHED })
        .groupBy("COALESCE(c.name, 'Okategoriserad')")
        .orderBy('count', 'DESC')
        .getRawMany();
    return {
      data: rows.map((row) => ({
        category: row.category,
        count: parseInt(row.count, 10),
      })),
    };
  }

  async cmsCo2SavingsStatistics(
    input: CmsCo2SavingsStatisticsInput,
  ): Promise<CmsCo2SavingsStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."paymentAcceptedAt"');
    const rows: { date: string; total: string }[] =
      await this.purchaseRepository
        .createQueryBuilder('p')
        .innerJoin('p.product', 'prod')
        .select(expr, 'date')
        .addSelect(
          'SUM(COALESCE(prod."co2SavingBuyer", 0) + COALESCE(prod."co2SavingSeller", 0))',
          'total',
        )
        .where('p."paymentAcceptedAt" IS NOT NULL')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        total: parseFloat(row.total),
      })),
    };
  }

  async cmsRepeatBuyerRateStatistics(
    input: CmsRepeatBuyerRateStatisticsInput,
  ): Promise<CmsRepeatBuyerRateStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'ranked."paymentAcceptedAt"');
    const rows: { date: string; total: string; repeat: string }[] =
      await this.purchaseRepository.manager
        .createQueryBuilder()
        .select(expr, 'date')
        .addSelect('COUNT(*)', 'total')
        .addSelect('COUNT(*) FILTER (WHERE ranked.rn > 1)', 'repeat')
        .from((subQuery) => {
          return subQuery
            .select('p."buyerId"', 'buyerId')
            .addSelect('p."paymentAcceptedAt"', 'paymentAcceptedAt')
            .addSelect(
              'ROW_NUMBER() OVER (PARTITION BY p."buyerId" ORDER BY p."paymentAcceptedAt")',
              'rn',
            )
            .from(Purchase, 'p')
            .where('p."paymentAcceptedAt" IS NOT NULL');
        }, 'ranked')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => {
        const total = parseInt(row.total, 10);
        const repeatCount = parseInt(row.repeat, 10);
        return {
          date: new Date(row.date).toISOString().split('T')[0],
          total,
          repeat: repeatCount,
          percent: total > 0 ? (repeatCount / total) * 100 : 0,
        };
      }),
    };
  }

  async cmsPurchaseFailureRateStatistics(
    input: CmsPurchaseFailureRateStatisticsInput,
  ): Promise<CmsPurchaseFailureRateStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."createdAt"');
    const rows: { date: string; total: string; failed: string }[] =
      await this.purchaseRepository
        .createQueryBuilder('p')
        .select(expr, 'date')
        .addSelect('COUNT(*)', 'total')
        .addSelect(
          `COUNT(*) FILTER (WHERE p.status = '${PurchaseStatusEnum.FINISHED_FAILED}')`,
          'failed',
        )
        .where('p.status IN (:...statuses)', {
          statuses: [
            PurchaseStatusEnum.FINISHED_FAILED,
            PurchaseStatusEnum.FINISHED_SUCCESS,
          ],
        })
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => {
        const total = parseInt(row.total, 10);
        const failed = parseInt(row.failed, 10);
        return {
          date: new Date(row.date).toISOString().split('T')[0],
          total,
          failed,
          percent: total > 0 ? (failed / total) * 100 : 0,
        };
      }),
    };
  }

  async cmsAverageTimeToPublishStatistics(
    input: CmsAverageTimeToPublishStatisticsInput,
  ): Promise<CmsAverageTimeToPublishStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const expr = this.truncExpr(groupBy, 'p."createdAt"');
    const rows: { date: string; averageDays: string }[] =
      await this.productRepository
        .createQueryBuilder('p')
        .select(expr, 'date')
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."createdAt")) / 86400)',
          'averageDays',
        )
        .where('p."publishedAt" IS NOT NULL')
        .groupBy(expr)
        .orderBy('date', 'ASC')
        .getRawMany();
    return {
      data: rows.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        averageDays: parseFloat(row.averageDays),
      })),
    };
  }
}
