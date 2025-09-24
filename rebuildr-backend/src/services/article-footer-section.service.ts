import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleFooterSection } from 'src/entities/article-footer-section.entity';
import { ArticleOrderInput } from 'src/resolvers/footer-section.resolver';
import { BadUserInputException } from 'src/exceptions';

@Injectable()
export class ArticleFooerSectionService {
  constructor(
    @InjectRepository(ArticleFooterSection)
    private articleFooterSectionRepository: Repository<ArticleFooterSection>,
  ) {}

  async findOne(footerSectionId: string) {
    const articleFooterSection = this.articleFooterSectionRepository.findOneBy({
      footerSectionId,
    });

    if (!articleFooterSection) throw BadUserInputException();
    return articleFooterSection;
  }

  async findMany(footerSectionId: string) {
    return this.articleFooterSectionRepository.find({
      where: {
        footerSectionId,
      },
      order: { orderIndex: 'ASC' },
    });
  }

  async syncArticles(
    footerSectionId: string,
    articles: ArticleOrderInput[],
  ): Promise<ArticleFooterSection[]> {
    try {
      // Remove existing relations
      await this.articleFooterSectionRepository.delete({ footerSectionId });

      // Create new relations
      const entities = articles.map((a) =>
        this.articleFooterSectionRepository.create({
          footerSectionId,
          articleId: a.articleId,
          orderIndex: a.orderIndex,
        }),
      );

      return this.articleFooterSectionRepository.save(entities);
    } catch (error) {
      throw BadUserInputException('Failed to sync articles' + error);
    }
  }
}
