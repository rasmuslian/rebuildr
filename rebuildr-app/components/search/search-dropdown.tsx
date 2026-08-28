import { isLoggedInVar, internalProductFilterVar } from "@/apollo/config";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import { Button } from "@components/buttons/button";
import { Dropdown } from "@components/dropdown/dropdown";
import MapThumbnail from "@components/maps/map-thumbnail";
import { Title } from "@components/typography/text";
import { initialFilterProduct } from "@context/filter-product-context";
import { useLocationContext } from "@context/location-context";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SearchWithResults } from "./search-with-results";
import { SearchEmptyState } from "./search-empty-state";
import { SEARCH } from "./queries";
import { useSearchContext } from "@context/search-context";
import { InternalSearchWithResults } from "./internal-search-with-results";

type InternalSearchEmptyStateQuery = {
  internalAdsCategories: {
    category: { id: string; name: string; image?: { url: string } | null };
  }[];
};

const INTERNAL_SEARCH_EMPTY_STATE = gql`
  query InternalSearchEmptyState {
    internalAdsCategories {
      category {
        id
        name
        image {
          url
        }
      }
    }
  }
`;

export const SearchDropdown = () => {
  const { searchState, setSearchState } = useSearchContext();
  const searchString = searchState.searchString?.trim();
  const searchCompleted = searchState.completedSearchString === searchString;

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
    // The public empty-state query includes public categories and history.
    // It must never run for an Återbanken search.
    skip:
      !searchState.dropdownVisible || searchState.searchScope === "internal",
  });

  const { data: internalData } = useQuery<InternalSearchEmptyStateQuery>(
    INTERNAL_SEARCH_EMPTY_STATE,
    {
      skip:
        !searchState.dropdownVisible ||
        searchState.searchScope !== "internal" ||
        !!searchString,
    },
  );

  const handleClose = () => {
    setSearchState({ dropdownVisible: false });
  };

  return (
    <Dropdown
      visible={searchState.dropdownVisible}
      position={searchState.dropdownPosition}
      ignoredPosition={searchState.dropdownAnchorPosition}
      showTopDivider={!searchState.dropdownHideTopDivider}
      zIndex={searchState.dropdownSource === "navbar" ? 1002 : undefined}
      onClose={handleClose}
    >
      <View style={{ padding: 16, gap: 16 }}>
        {searchState.searchScope === "internal" ? (
          searchString ? (
            <InternalSearchWithResults
              data={
                searchCompleted ? searchState.internalSearchData : undefined
              }
              searchString={searchString}
              searchCompleted={searchCompleted}
            />
          ) : (
            <InternalSearchEmptyState
              categories={internalData?.internalAdsCategories ?? []}
            />
          )
        ) : searchString ? (
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

const InternalSearchEmptyState = ({
  categories,
}: {
  categories: InternalSearchEmptyStateQuery["internalAdsCategories"];
}) => {
  const { setSearchState } = useSearchContext();
  const { userCoords } = useLocationContext();

  const openInternalSearch = () => {
    setSearchState({ dropdownVisible: false, searchScope: "internal" });
    router.navigate("/internal/search");
  };

  return (
    <View style={{ gap: 12, paddingBottom: 16 }}>
      <Title size="medium">Sök på kartan</Title>
      <Pressable onPress={openInternalSearch}>
        <MapThumbnail
          coords={
            userCoords ? [userCoords.latitude, userCoords.longitude] : undefined
          }
          cta={
            <Button
              label="Visa på karta"
              type="text"
              icon="map"
              style={{ backgroundColor: "white" }}
              onPress={openInternalSearch}
            />
          }
        />
      </Pressable>

      <Title size="medium">Populära kategorier</Title>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {categories.slice(0, 8).map(({ category }) => (
          <ImageQuickLink
            key={category.id}
            onPress={() => {
              internalProductFilterVar({
                ...initialFilterProduct,
                rootCategoryIds: [category.id],
              });
              setSearchState({
                dropdownVisible: false,
                searchString: undefined,
                searchScope: "internal",
              });
              router.navigate("/internal/search");
            }}
            source={category.image?.url ?? PlaceholderCategory.uri}
            label={category.name}
          />
        ))}
      </View>
    </View>
  );
};
