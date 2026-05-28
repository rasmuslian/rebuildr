import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataSource, In } from 'typeorm';

import { Article } from 'src/entities/article.entity';
import { FooterSectionEntry } from 'src/entities/footer-section-entry.entity';

export interface IFooterSectionLoaders {
  articleLoader: DataLoader<string, Article | null>;
  entriesLoader: DataLoader<string, FooterSectionEntry[]>;
}

@Injectable()
export class FooterSectionLoader {
  constructor(private readonly dataSource: DataSource) {}

  private entriesLoader() {
    return new DataLoader<string, FooterSectionEntry[]>(
      async (footerSectionIds: readonly string[]) => {
        const entries = await this.dataSource
          .getRepository(FooterSectionEntry)
          .find({
            where: { footerSectionId: In(footerSectionIds) },
            order: { orderIndex: 'ASC' },
          });

        return footerSectionIds.map((id) =>
          entries.filter((entry) => entry.footerSectionId === id),
        );
      },
    );
  }

  private articleLoader() {
    return new DataLoader<string, Article | null>(async (articleIds) => {
      const articles = await this.dataSource.getRepository(Article).find({
        where: { id: In(articleIds) },
      });

      return articleIds.map(
        (id) => articles.find((article) => article.id === id) ?? null,
      );
    });
  }

  createLoaders(): IFooterSectionLoaders {
    return {
      articleLoader: this.articleLoader(),
      entriesLoader: this.entriesLoader(),
    };
  }
}
