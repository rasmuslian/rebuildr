import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/entities/search-result.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import {
  CreateSearchResultInput,
  GetSimilarSearchResultsInput,
} from 'src/resolvers/search-result.resolver';
import { BadUserInputException } from 'src/exceptions';

@Injectable()
export class SearchResultService {
  constructor(
    @InjectRepository(SearchResult)
    private readonly searchResultRepository: Repository<SearchResult>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createSearchResult(
    input: CreateSearchResultInput,
    currentUserId?: string,
  ): Promise<SearchResult | null> {
    if (!currentUserId || !input.searchString) {
      return null;
    }

    const normalizedSearchString = input.searchString.trim().toLowerCase();

    const searcher = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!searcher) {
      throw BadUserInputException();
    }

    const existingSearchResult = await this.searchResultRepository.findOne({
      where: {
        searcher: { id: searcher.id },
        searchString: normalizedSearchString,
        deletedAt: IsNull(),
      },
    });

    if (existingSearchResult) {
      return await this.searchResultRepository.save({
        ...existingSearchResult,
        updatedAt: new Date(),
      });
    }
    const searchResult = new SearchResult();
    searchResult.searchString = normalizedSearchString;
    searchResult.searcher = searcher;

    return await this.searchResultRepository.save(searchResult);
  }

  async clearSearchHistory(userId: string) {
    await this.dataSource.query(
      `UPDATE search_result 
       SET 
        "deletedAt" = NOW()
        WHERE "searcherId" = $1`,
      [userId],
    );
    return true;
  }

  async getSimilarSearchResults(input: GetSimilarSearchResultsInput) {
    return await this.searchResultRepository
      .createQueryBuilder('sr')
      .select('DISTINCT ON (sr."searchString") sr.*')
      .where(`sr."searchString" ILIKE :search`, { search: `%${input.searchString}%` })
      .limit(5)
      .getRawMany();
  }

  async getLatestSearch(userId: string): Promise<SearchResult> {
    return await this.searchResultRepository.findOne({
      where: {
        searcher: { id: userId },
      },
      order: { updatedAt: 'DESC' },
    });
  }
}
