import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterCompetition } from 'src/entities/newsletter-competition.entity';
import { CmsUpdateNewsletterCompetitionInput } from 'src/resolvers/newsletter-competition.resolver';
import { FileService } from './file.service';
import { BadUserInputException } from 'src/exceptions';

@Injectable()
export class NewsletterCompetitionService {
  constructor(
    @InjectRepository(NewsletterCompetition)
    private repo: Repository<NewsletterCompetition>,
    private fileService: FileService,
  ) {}

  async get(): Promise<NewsletterCompetition> {
    const existing = await this.repo.findOne({
      where: {},
      relations: { productImage: true },
    });
    if (existing) return existing;

    const record = this.repo.create({
      title: '',
      productTitle: '',
      productValue: '',
      bodyText: '',
      nextDrawDate: new Date(),
    });
    return this.repo.save(record);
  }

  async update(input: CmsUpdateNewsletterCompetitionInput) {
    const record = await this.get();

    try {
      Object.assign(record, {
        title: input.title,
        productTitle: input.productTitle,
        productValue: input.productValue,
        bodyText: input.bodyText,
        nextDrawDate: input.nextDrawDate,
      });

      if (input.productImage) {
        record.productImage = await this.fileService.createFile(
          input.productImage,
        );
      }

      await this.repo.save(record);

      const imagePutUrl = input.productImage
        ? await this.fileService.uploadFile(record.productImage, true)
        : null;

      return { newsletterCompetition: record, imagePutUrl };
    } catch (error) {
      throw BadUserInputException(
        'Failed to update newsletter competition: ' + error,
      );
    }
  }
}
