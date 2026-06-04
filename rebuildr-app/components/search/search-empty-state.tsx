import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import { Divider } from "@components/dividers/divider";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@components/buttons/button";
import { Icon } from "@icons/icon";
import { ClearSearchHistoryMutation, SearchQuery } from "@/gql/graphql";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useMutation } from "@apollo/client";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import { CLEAR_SEARCH_HISTORY_MUTATION } from "./queries";
import { useSearchContext } from "@context/search-context";
import MapThumbnail from "@components/maps/map-thumbnail";
import { useScreenType } from "@hooks/useScreenType";
import { useLocationContext } from "@context/location-context";
import { capitalFirstLetter } from "@/utils/formattings";

type Props = {
  data: SearchQuery | undefined;
  size?: "small" | "large";
};

export const SearchEmptyState = ({ data, size = "large" }: Props) => {
  const { filterBuilder } = useFilterProduct();
  const searchContext = useSearchContext();
  const { isDesktop } = useScreenType();
  const { userCoords } = useLocationContext();

  const [clearSearchHistory, { client }] =
    useMutation<ClearSearchHistoryMutation>(CLEAR_SEARCH_HISTORY_MUTATION, {
      onCompleted: (data) => {
        if (data.clearSearchHistory) {
          client.refetchQueries({ include: ["Search"] });
        }
      },
    });

  const Header = ({ children }: { children: React.ReactNode }) => {
    if (size === "large") {
      return <Headline size="small">{children}</Headline>;
    } else {
      return <Title size="medium">{children}</Title>;
    }
  };

  const onPressMap = () => {
    if (isDesktop) {
      router.navigate("/search");
    } else {
      router.navigate("/map");
    }
    searchContext.setSearchState({ dropdownVisible: false });
  };

  return (
    <>
      <View style={[{ gap: 12, paddingBottom: 16 }]}>
        <Header>Sök på kartan</Header>
        <Pressable onPress={onPressMap}>
          <MapThumbnail
            coords={
              userCoords
                ? [userCoords.latitude, userCoords.longitude]
                : undefined
            }
            cta={
              <Button
                label="Visa på karta"
                type="text"
                icon="map"
                style={{ backgroundColor: "white" }}
                onPress={onPressMap}
              />
            }
          />
        </Pressable>

        <Header>Populära kategorier</Header>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {data?.popularCategories.map((category, i) => (
            <ImageQuickLink
              key={i}
              onPress={() => {
                filterBuilder
                  .setCategories([category])
                  .setSearchString("")
                  .apply();

                searchContext.setSearchState({
                  dropdownVisible: false,
                  searchString: undefined,
                });

                router.navigate({
                  pathname: "/search/products/[categoryId]",
                  params: {
                    categoryId: category.id,
                  },
                });
              }}
              source={
                category.image ? category.image.url : PlaceholderCategory.uri
              }
              label={category.name}
            />
          ))}
        </View>
      </View>
      {!!data?.getSearchResults?.length && (
        <View>
          <Divider />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            <Header>Tidigare sökningar</Header>
            <Button
              label="Rensa"
              type="tonal"
              onPress={() => clearSearchHistory()}
            />
          </View>
          <View style={{ gap: 16 }}>
            {data.getSearchResults.map((searchResult, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  searchContext.setSearchState({
                    dropdownVisible: false,
                    searchString: searchResult.searchString,
                  });
                  searchContext.search(searchResult.searchString);
                  filterBuilder
                    .reset()
                    .setSearchString(searchResult.searchString)
                    .apply();
                  router.navigate("/search/products");
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingRight: 12,
                  }}
                >
                  <View>
                    <Label size="large">
                      "{capitalFirstLetter(searchResult.searchString)}"
                    </Label>
                    <Body size="small">
                      {searchResult.count}{" "}
                      {searchResult.count === 1 ? "träff" : "träffar"}
                    </Body>
                  </View>
                  <Icon icon="search" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );
};
