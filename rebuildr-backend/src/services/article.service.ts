import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
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
    if (!article) throw NotFoundException();
    return article;
  }

  async findOneBySlug(slug: string) {
    const article = await this.articleRepository.findOneBy({ slug });
    if (!article) throw NotFoundException();
    return article;
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(title, { lower: true, strict: true, locale: 'sv' });
    let slug = base;
    let counter = 1;
    while (true) {
      const existing = await this.articleRepository.findOneBy({ slug });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${base}-${counter++}`;
    }
  }

  async createArticle(input: CmsCreateArticleInput): Promise<Article> {
    try {
      const slug = await this.generateUniqueSlug(input.title);
      const article = this.articleRepository.create({ ...input, slug });
      return await this.articleRepository.save(article);
    } catch (error) {
      throw BadUserInputException('Failed to create article' + error);
    }
  }

  async updateArticle(input: CmsUpdateArticleInput): Promise<Article> {
    const article = await this.findOne(input.id);
    if (!article) throw NotFoundException('Article not found');

    try {
      const slug = await this.generateUniqueSlug(input.title, input.id);
      Object.assign(article, { ...input, slug });
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
    const { pageSize = 10, page = 0 } = input;
    const skip = Math.max(0, pageSize * page);

    const [articles, total] = await this.articleRepository.findAndCount({
      take: pageSize,
      skip,
      order: { updatedAt: 'DESC' },
    });

    return { articles, total };
  }
}
