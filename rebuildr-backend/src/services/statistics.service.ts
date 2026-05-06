import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Purchase } from 'src/entities/purchase.entity';
import {
  CmsProductStatisticsGroupByEnum,
  CmsProductStatisticsInput,
  CmsProductStatisticsResponse,
  CmsPurchaseStatisticsInput,
  CmsPurchaseStatisticsResponse,
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
}
