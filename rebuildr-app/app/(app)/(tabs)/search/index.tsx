import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";
import { SEARCH } from "@components/search/queries";
import { useSearchContext } from "@context/search-context";
import { SearchBar } from "@components/search/search-bar";
import RebuildrHead from "@components/meta-data/rebuildr-head";
import { useUser } from "@hooks/useUser";

export default function Search() {
  const { searchState } = useSearchContext();
  const { isLoggedIn } = useUser();
  const searchString = searchState.searchString?.trim();
  const searchCompleted = searchState.completedSearchString === searchString;

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      searchResult: { page: 0, pageSize: 10 },
      isLoggedIn,
    },
  });

  return (
    <>
      <RebuildrHead title="Sök" />
      <ScreenLayout
        headerComponent={
          <SearchBar
            placeholder="Vad letar du efter?"
            searchOnSubmit
            autoFocus
          />
        }
        style={{ gap: 16 }}
      >
        {searchString ? (
          <SearchWithResults
            data={searchCompleted ? searchState.searchData : undefined}
            searchString={searchString}
            searchCompleted={searchCompleted}
          />
        ) : (
          <SearchEmptyState data={data} />
        )}
      </ScreenLayout>
    </>
  );
}
