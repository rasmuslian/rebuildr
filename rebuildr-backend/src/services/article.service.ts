import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from 'src/entities/article.entity';
import {
  CmsCreateArticleInput,
  CmsUpdateArticleInput,
  ListArticlesInput,
  ListArticlesResponse,
} from 'src/resolvers/article.resolver';
import { BadUserInputException, NotFoundException } from 'src/exceptions';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
  ) {}

  async findOne(id: string) {
    const article = await this.articleRepository.findOneBy({ id });
    if (!article) throw BadUserInputException();
    return article;
  }

  async createArticle(input: CmsCreateArticleInput): Promise<Article> {
    try {
      const article = this.articleRepository.create(input);
      return await this.articleRepository.save(article);
    } catch (error) {
      throw BadUserInputException('Failed to create article' + error);
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

  async deleteArticle(articleId: string): Promise<boolean> {
    const result = await this.articleRepository.delete(articleId);
    return !!result.affected && result.affected > 0;
  }

  async listArticles(input: ListArticlesInput): Promise<ListArticlesResponse> {
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
