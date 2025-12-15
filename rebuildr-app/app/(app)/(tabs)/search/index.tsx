import { isLoggedInVar } from "@/apollo/config";
import {
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
  SearchQuery,
  SearchQueryVariables,
} from "@/gql/graphql";
import { useMutation, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { TextInputSubmitEditingEvent } from "react-native";
import { router } from "expo-router";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { CREATE_SEARCH_RESULT, SEARCH } from "@components/search/queries";
import { useSearchContext } from "@context/search-context";
import { SearchBar } from "@components/search/search-bar";

export default function Search() {
  const { searchState, setSearchState, search } = useSearchContext();
  const filterContext = useFilterProduct();

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });

  const [createSearchResult] = useMutation<
    CreateSearchResultMutation,
    CreateSearchResultMutationVariables
  >(CREATE_SEARCH_RESULT);

  const handleChange = (text: string) => {
    setSearchState({ searchString: text });
    search(text);
  };

  const onSubmit = (event: TextInputSubmitEditingEvent) => {
    const { text } = event.nativeEvent;

    if (text) {
      createSearchResult({ variables: { input: { searchString: text } } });
    }

    filterContext.resetAndSetSearchString(text);
    router.navigate("/search/products");
  };

  return (
    <ScreenLayout
      headerComponent={
        <SearchBar
          placeholder="Vad letar du efter?"
          onChange={handleChange}
          onSubmitEditing={onSubmit}
          searchOnSubmit
          autoFocus
        />
      }
      style={{ gap: 16 }}
    >
      {searchState.searchString ? (
        <SearchWithResults
          data={searchState.searchData}
          searchString={searchState.searchString}
        />
      ) : (
        <SearchEmptyState data={data} />
      )}
    </ScreenLayout>
  );
}
