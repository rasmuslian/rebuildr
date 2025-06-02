import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/entities/search-result.entity';
import { DataSource, ILike, IsNull, Repository } from 'typeorm';
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
  ): Promise<SearchResult> {
    if (!currentUserId || !input.searchString) {
      return null;
    }

    const searcher = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!searcher) {
      throw BadUserInputException();
    }

    const existingSearchResult = await this.searchResultRepository.findOne({
      where: {
        searcher: { id: searcher.id },
        searchString: ILike(input.searchString),
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
    searchResult.searchString = input.searchString;
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
    const res = await this.searchResultRepository.find({
      where: {
        searchString: ILike(`%${input.searchString}%`),
      },
      take: 5,
    });
    return res;
  }
}
