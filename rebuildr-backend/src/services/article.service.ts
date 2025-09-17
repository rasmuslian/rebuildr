import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from 'src/entities/article.entity';
import {
  CmsCreateArticleInput,
  CmsUpdateArticleInput,
  CmsListArticlesInput,
  CmsListArticlesResponse,
} from 'src/resolvers/article.resolver';
import { BadUserInputException, NotFoundException } from 'src/exceptions';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
  ) {}

  async findOne(id: string) {
    return await this.articleRepository.findOneBy({ id });
  }

  async createArticle(input: CmsCreateArticleInput): Promise<Article> {
    try {
      const article = this.articleRepository.create(input);
      return await this.articleRepository.save(article);
    } catch (error) {
      throw BadUserInputException();
    }
  }

  async updateArticle(input: CmsUpdateArticleInput): Promise<Article> {
    const article = await this.findOne(input.id);
    if (!article) throw NotFoundException('Article not found');

    Object.assign(article, input);

    try {
      return await this.articleRepository.save(article);
    } catch (error) {
      throw BadUserInputException('Failed to update article: ' + error);
    }
  }

  async cmsListArticles(
    input: CmsListArticlesInput,
  ): Promise<CmsListArticlesResponse> {
    const pageSize = Number(input.pageSize) || 10;
    const page = Number(input.page) || 0;
    const skip = Math.max(0, pageSize * page);

    const [articles, total] = await this.articleRepository.findAndCount({
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    return { articles, total };
  }
}
