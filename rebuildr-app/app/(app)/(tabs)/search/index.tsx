import { isLoggedInVar } from "@/apollo/config";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";
import { SEARCH } from "@components/search/queries";
import { useSearchContext } from "@context/search-context";
import { SearchBar } from "@components/search/search-bar";

export default function Search() {
  const { searchState } = useSearchContext();

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });

  return (
    <ScreenLayout
      headerComponent={
        <SearchBar placeholder="Vad letar du efter?" searchOnSubmit autoFocus />
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
