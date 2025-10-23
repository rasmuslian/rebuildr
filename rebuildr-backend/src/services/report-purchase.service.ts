import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from 'src/entities/purchase.entity';
import {
  ReportPurchase,
  ReportPurchaseResolutionEnum,
} from 'src/entities/report-purchase.entity';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import { CreateReportPurchaseInput } from 'src/resolvers/report-purchase.resolver';
import { Repository } from 'typeorm';
import { SystemMessagesService } from './system-messages.service';
import { PurchaseService } from './purchase.service';
import { Logger } from 'winston';
import { MailService } from './mail.service';

@Injectable()
export class ReportPurchaseService {
  constructor(
    @InjectRepository(ReportPurchase)
    private reportPurchaseRepository: Repository<ReportPurchase>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private systemMessagesService: SystemMessagesService,
    @Inject(forwardRef(() => PurchaseService))
    private purchaseService: PurchaseService,
    private mailService: MailService,
  ) {}

  async createReportPurchase(
    input: CreateReportPurchaseInput,
    currentUserId: string,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id: input.purchaseId,
      },
      relations: {
        buyer: true,
        product: { seller: true },
        reportPurchase: true,
      },
    });

    if (!purchase) {
      throw BadUserInputException();
    }
    if (purchase.buyerId !== currentUserId) {
      throw ForbiddenException('Only buyer can report a purchase');
    }
    if (!this.purchaseService.canReport(purchase)) {
      throw BadUserInputException('Can not report this purchase');
    }
    if (purchase.reportPurchase) {
      throw BadUserInputException('Can not report this purchase again');
    }

    const report = new ReportPurchase();
    report.message = input.message;
    report.type = input.type;
    report.purchase = purchase;

    this.systemMessagesService.purchaseReportedBuyer(
      purchase.buyer,
      purchase.product.seller,
      purchase.product,
    );
    this.systemMessagesService.purchaseReportedSeller(
      purchase.buyer,
      purchase.product.seller,
      purchase.product,
    );

    purchase.pausedAt = new Date();
    await this.purchaseRepository.save(purchase);

    await this.mailService.sendReportpurchaseEmail({
      buyer: purchase.buyer,
      seller: purchase.product.seller,
      product: purchase.product,
      purchase: purchase,
      report: report,
    });

    return await this.reportPurchaseRepository.save(report);
  }

  async resolveRepport(
    resolution: ReportPurchaseResolutionEnum,
    reportPurchaseId: string,
    logger: Logger,
  ) {
    const report = await this.reportPurchaseRepository.findOne({
      where: { id: reportPurchaseId },
      relations: { purchase: { buyer: true, product: { seller: true } } },
    });
    logger.info('Resolving purchase report', {
      reportId: reportPurchaseId,
      resolution,
    });
    switch (resolution) {
      case ReportPurchaseResolutionEnum.REFUND:
        report.resolution = ReportPurchaseResolutionEnum.REFUND;
        this.systemMessagesService.supportErrandConcludedBuyer(
          report.purchase.buyer,
          report.purchase.product.seller,
          report.purchase.product,
          'Pengarna återbetalas till dig',
        );
        this.systemMessagesService.supportErrandConcludedSeller(
          report.purchase.buyer,
          report.purchase.product.seller,
          report.purchase.product,
          'Pengarna återbetalas till köparen',
        );
        await this.reportPurchaseRepository.save(report);
        break;
      case ReportPurchaseResolutionEnum.PROCEED:
        report.resolution = ReportPurchaseResolutionEnum.PROCEED;
        this.systemMessagesService.supportErrandConcludedBuyer(
          report.purchase.buyer,
          report.purchase.product.seller,
          report.purchase.product,
          'Utbetalningen går vidare till säljaren',
        );
        this.systemMessagesService.supportErrandConcludedSeller(
          report.purchase.buyer,
          report.purchase.product.seller,
          report.purchase.product,
          'Utbetalningen går vidare till dig',
        );
        break;
      case ReportPurchaseResolutionEnum.OTHER:
        report.resolution = ReportPurchaseResolutionEnum.PROCEED;
        break;
    }

    return await this.reportPurchaseRepository.save(report);
  }
}
