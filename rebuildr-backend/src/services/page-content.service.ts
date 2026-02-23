import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageContent } from 'src/entities/page-content.entity';
import { PageEnum } from 'src/constants/enums';
import { BadUserInputException, NotFoundException } from 'src/exceptions';
import {
  ListPageContentInput,
  ListPageContentResponse,
  UpdatePageContentInput,
} from 'src/resolvers/page-content.resolver';

@Injectable()
export class PageContentService {
  constructor(
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,
  ) {}

  async findById(id: string): Promise<PageContent> {
    const pageContent = await this.pageContentRepository.findOneBy({ id });
    if (!pageContent) throw NotFoundException();
    return pageContent;
  }

  async findByPage(page: PageEnum): Promise<PageContent> {
    const pageContent = await this.pageContentRepository.findOneBy({ page });
    if (!pageContent) throw NotFoundException();
    return pageContent;
  }

  async findAll(input: ListPageContentInput): Promise<ListPageContentResponse> {
    const { pageSize = 10, page = 0 } = input;
    const skip = Math.max(0, pageSize * page);

    const [pages, total] = await this.pageContentRepository.findAndCount({
      take: pageSize,
      skip,
      order: { updatedAt: 'DESC' },
    });

    return { pages, total };
  }

  async update(input: UpdatePageContentInput): Promise<PageContent> {
    const { id, heroHtml } = input;

    const pageContent = await this.pageContentRepository.findOneBy({ id });
    if (!pageContent) throw NotFoundException();

    try {
      Object.assign<PageContent, Partial<PageContent>>(pageContent, {
        heroHtml,
      });

      return this.pageContentRepository.save(pageContent);
    } catch (error) {
      throw BadUserInputException('Failed to update page content: ' + error);
    }
  }
}
