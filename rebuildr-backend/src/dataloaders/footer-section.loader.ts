import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataSource, In } from 'typeorm';

import { FooterSectionEntry } from 'src/entities/footer-section-entry.entity';

export interface IFooterSectionLoaders {
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

  createLoaders(): IFooterSectionLoaders {
    return {
      entriesLoader: this.entriesLoader(),
    };
  }
}
