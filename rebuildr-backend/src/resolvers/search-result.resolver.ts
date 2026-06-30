import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { ISearchResultLoaders } from 'src/dataloaders/search-result.loader';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SearchResult } from 'src/entities/search-result.entity';
import { SearchResultService } from 'src/services/search-result.service';

@InputType()
export class CreateSearchResultInput {
  @Field()
  searchString: string;
}

@InputType()
export class GetSearchResultsInput {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}

@Resolver(() => SearchResult)
export class SearchResultResolver {
  constructor(private readonly searchResultService: SearchResultService) {}

  @Query(() => [SearchResult])
  @UseGuards(GqlAuthGuard)
  async getSearchResults(
    @Args('input') input: GetSearchResultsInput,
    @CurrentUser() user: AuthedUserType,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ): Promise<SearchResult[]> {
    return await userLoaders.getSearchResultsLoader(input).load(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async clearSearchHistory(
    @CurrentUser() user: AuthedUserType,
  ): Promise<boolean> {
    return await this.searchResultService.clearSearchHistory(user.id);
  }

  @ResolveField(() => Int)
  async count(
    @Parent() searchResult: SearchResult,
    @Context('searchResultLoaders') searchResultLoaders: ISearchResultLoaders,
  ): Promise<number> {
    return await searchResultLoaders.getSearchResultProductCount.load(
      searchResult.id,
    );
  }
}
