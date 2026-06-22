import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Dropdown } from "@components/dropdown/dropdown";
import { View } from "react-native";
import { isLoggedInVar } from "@/apollo/config";
import { SearchWithResults } from "./search-with-results";
import { SearchEmptyState } from "./search-empty-state";
import { SEARCH } from "./queries";
import { useSearchContext } from "@context/search-context";

export const SearchDropdown = () => {
  const { searchState, setSearchState } = useSearchContext();
  const searchString = searchState.searchString?.trim();
  const searchCompleted = searchState.completedSearchString === searchString;

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });

  const handleClose = () => {
    setSearchState({ dropdownVisible: false });
  };

  return (
    <Dropdown
      visible={searchState.dropdownVisible}
      position={searchState.dropdownPosition}
      ignoredPosition={searchState.dropdownAnchorPosition}
      onClose={handleClose}
    >
      <View style={{ padding: 16, gap: 16 }}>
        {searchString ? (
          <SearchWithResults
            data={searchCompleted ? searchState.searchData : undefined}
            searchString={searchString}
            searchCompleted={searchCompleted}
            size="small"
          />
        ) : (
          <SearchEmptyState data={data} size="small" />
        )}
      </View>
    </Dropdown>
  );
};
