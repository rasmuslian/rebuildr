import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { ReportProduct } from 'src/entities/report-product.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
import { CreateReportProductInput } from 'src/resolvers/report-product.resolver';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';

@Injectable()
export class ReportProductService {
  constructor(
    @InjectRepository(ReportProduct)
    private reportProductRepository: Repository<ReportProduct>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private mailService: MailService,
  ) {}

  async createReportProduct(
    input: CreateReportProductInput,
    currentUserId: string,
  ) {
    const reporter = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { seller: true },
    });
    if (!reporter || !product) {
      throw BadUserInputException();
    }
    if (product.sellerId === currentUserId) {
      throw BadUserInputException('Seller can not report their own product');
    }
    const existingReport = await this.reportProductRepository.findOne({
      where: {
        reporterId: currentUserId,
        productId: input.productId,
      },
    });
    if (existingReport) {
      throw BadUserInputException("Can't report same product twice");
    }

    const report = new ReportProduct();
    report.type = input.type;
    report.message = input.message;
    report.reporter = reporter;
    report.product = product;

    const savedReport = await this.reportProductRepository.save(report);

    await this.mailService.sendReportProductEmail({
      reporter,
      seller: product.seller,
      product,
      report: savedReport,
    });

    return savedReport;
  }
}
