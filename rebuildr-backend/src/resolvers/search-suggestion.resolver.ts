import {
  Args,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql';
import { SearchSuggestionService } from 'src/services/search-suggestion.service';

export enum SearchSuggestionTypeEnum {
  PRODUCT_TERM = 'PRODUCT_TERM',
  BRAND = 'BRAND',
  USE_CASE = 'USE_CASE',
}
registerEnumType(SearchSuggestionTypeEnum, {
  name: 'SearchSuggestionTypeEnum',
});

@InputType()
export class GetSearchSuggestionsInput {
  @Field()
  searchString: string;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class SearchSuggestion {
  @Field()
  label: string;

  @Field(() => SearchSuggestionTypeEnum)
  type: SearchSuggestionTypeEnum;

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => Int)
  productCount: number;
}

@Resolver(() => SearchSuggestion)
export class SearchSuggestionResolver {
  constructor(
    private readonly searchSuggestionService: SearchSuggestionService,
  ) {}

  @Query(() => [SearchSuggestion])
  async searchSuggestions(@Args('input') input: GetSearchSuggestionsInput) {
    return await this.searchSuggestionService.getSearchSuggestions(input);
  }
}
