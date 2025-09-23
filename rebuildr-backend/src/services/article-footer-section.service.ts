import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleFooterSection } from 'src/entities/article-footer-section.entity';
import { ArticleOrderInput } from 'src/resolvers/footer-section.resolver';

@Injectable()
export class ArticleFooerSectionService {
  constructor(
    @InjectRepository(ArticleFooterSection)
    private articleFooterSectionRepository: Repository<ArticleFooterSection>,
  ) {}

  async findOne(footerSectionId: string) {
    return this.articleFooterSectionRepository.findOneBy({
      footerSectionId,
    });
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
  ): Promise<boolean> {
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

      await this.articleFooterSectionRepository.save(entities);

      return true;
    } catch (error) {
      console.error('Error syncing articles:', error);
      return false;
    }
  }
}
