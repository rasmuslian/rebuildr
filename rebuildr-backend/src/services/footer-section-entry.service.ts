import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FooterSectionEntry,
  FooterSectionEntryType,
} from 'src/entities/footer-section-entry.entity';
import { FooterEntryInput } from 'src/resolvers/footer-section.resolver';
import { BadUserInputException } from 'src/exceptions';
import { validateWebsite } from 'src/utility/website';

@Injectable()
export class FooterSectionEntryService {
  constructor(
    @InjectRepository(FooterSectionEntry)
    private footerSectionEntryRepository: Repository<FooterSectionEntry>,
  ) {}

  async findOne(footerSectionId: string) {
    const entry = this.footerSectionEntryRepository.findOneBy({
      footerSectionId,
    });

    if (!entry) throw BadUserInputException();
    return entry;
  }

  async findMany(footerSectionId: string) {
    return this.footerSectionEntryRepository.find({
      where: {
        footerSectionId,
      },
      order: { orderIndex: 'ASC' },
    });
  }

  async syncEntries(
    footerSectionId: string,
    entries: FooterEntryInput[],
  ): Promise<FooterSectionEntry[]> {
    try {
      await this.footerSectionEntryRepository.delete({ footerSectionId });

      const entities = entries.map((entry) => {
        if (entry.type === FooterSectionEntryType.LINK) {
          if (!entry.label || !entry.url) {
            throw BadUserInputException();
          }
        }
        if (entry.type === FooterSectionEntryType.ARTICLE) {
          if (!entry.articleId) {
            throw BadUserInputException();
          }
        }
        return this.footerSectionEntryRepository.create({
          footerSectionId,
          type: entry.type,
          orderIndex: entry.orderIndex,
          articleId: entry.articleId ?? null,
          label: entry.label ?? null,
          url: entry.url ? validateWebsite(entry.url) : null,
        });
      });

      return this.footerSectionEntryRepository.save(entities);
    } catch (error) {
      throw BadUserInputException('Failed to sync entries' + error);
    }
  }
}
