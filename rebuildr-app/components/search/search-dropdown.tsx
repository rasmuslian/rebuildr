import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { Dropdown } from "@components/dropdown/dropdown";
import { View } from "react-native";
import { isLoggedInVar } from "@/apollo/config";
import { SearchWithResults } from "./search-with-results";
import { SearchEmptyState } from "./search-empty-state";
import { SEARCH } from "./queries";
import { useSearchContext } from "@context/search-context";

export const SearchDropdown = () => {
  const { searchState, setSearchState } = useSearchContext();

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
      onClose={handleClose}
    >
      <View style={{ marginTop: 12 }}>
        <Divider />
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        {searchState.searchString ? (
          <SearchWithResults
            data={searchState.searchData}
            searchString={searchState.searchString}
            size="small"
          />
        ) : (
          <SearchEmptyState data={data} size="small" />
        )}
      </View>
    </Dropdown>
  );
};
