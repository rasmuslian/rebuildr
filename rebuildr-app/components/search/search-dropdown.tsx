import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { Dropdown } from "@components/dropdown/dropdown";
import { SearchDropdownContext } from "@context/search-dropdown-context";
import { useContext } from "react";
import { View } from "react-native";
import { isLoggedInVar } from "@/apollo/config";
import { SearchWithResults } from "./search-with-results";
import { SearchEmptyState } from "./search-empty-state";
import { SEARCH } from "./queries";

export const SearchDropdown = () => {
  const { visible, position, setVisible, searchData, searchString } =
    useContext(SearchDropdownContext);

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Dropdown visible={visible} position={position} onClose={handleClose}>
      <View style={{ marginTop: 12 }}>
        <Divider />
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        {searchString ? (
          <SearchWithResults
            data={searchData}
            searchString={searchString}
            size="small"
          />
        ) : (
          <SearchEmptyState data={data} size="small" />
        )}
      </View>
    </Dropdown>
  );
};
