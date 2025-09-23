import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FooterSection } from 'src/entities/footer-section.entity';
import {
  CmsCreateFooterSectionInput,
  CmsUpdateFooterSectionInput,
} from 'src/resolvers/footer-section.resolver';
import { BadUserInputException, NotFoundException } from 'src/exceptions';
import { ArticleFooerSectionService } from 'src/services/article-footer-section.service';

@Injectable()
export class FooterSectionService {
  constructor(
    @InjectRepository(FooterSection)
    private footerSectionRepository: Repository<FooterSection>,
    private articleFooerSectionService: ArticleFooerSectionService,
  ) {}

  async findOne(id: string) {
    return this.footerSectionRepository.findOneBy({ id });
  }

  async createFooterSection(
    input: CmsCreateFooterSectionInput,
  ): Promise<FooterSection> {
    try {
      const footerSection = this.footerSectionRepository.create({
        title: input.title,
        orderIndex: input.orderIndex,
      });

      await this.footerSectionRepository.save(footerSection);
      await this.articleFooerSectionService.syncArticles(
        footerSection.id,
        input.articles,
      );
      return footerSection;
    } catch (error) {
      throw BadUserInputException('Failed to create footer section' + error);
    }
  }

  async updateFooterSection(
    input: CmsUpdateFooterSectionInput,
  ): Promise<FooterSection> {
    const footerSection = await this.findOne(input.id);
    if (!footerSection) throw NotFoundException('Footer section not found');

    footerSection.title = input.title;
    footerSection.orderIndex = input.orderIndex;

    try {
      await this.footerSectionRepository.save(footerSection);
      await this.articleFooerSectionService.syncArticles(
        input.id,
        input.articles,
      );

      return footerSection;
    } catch (error) {
      throw BadUserInputException('Failed to update footer section: ' + error);
    }
  }

  async deleteFooterSection(footerSectionId: string): Promise<boolean> {
    const result = await this.footerSectionRepository.delete(footerSectionId);
    return !!result.affected && result.affected > 0;
  }

  async listFooterSections(): Promise<FooterSection[]> {
    return this.footerSectionRepository.find({
      order: {
        orderIndex: 'ASC',
        updatedAt: 'DESC',
      },
    });
  }
}
