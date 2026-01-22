import { isLoggedInVar } from "@/apollo/config";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";
import { SEARCH } from "@components/search/queries";
import { useSearchContext } from "@context/search-context";
import { SearchBar } from "@components/search/search-bar";
import { Divider } from "@components/dividers/divider";
import MapThumbnail from "@components/maps/map-thumbnail";
import { Pressable } from "react-native";
import { useLocationContext } from "@context/location-context";
import { useRouter } from "expo-router";
import { Button } from "@components/buttons/button";
import { Headline } from "@components/typography/text";
import RebuildrHead from "@components/meta-data/rebuildr-head";

export default function Search() {
  const { searchState } = useSearchContext();
  const { userCoords } = useLocationContext();
  const router = useRouter();

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
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
        <Headline size="small">Sök på kartan</Headline>
        <Pressable onPress={() => router.navigate("/map")}>
          <MapThumbnail
            coords={
              userCoords
                ? [userCoords.latitude, userCoords.longitude]
                : undefined
            }
            style={{ marginBottom: 16 }}
            cta={
              <Button
                label="Visa på karta"
                type="text"
                icon="map"
                style={{ backgroundColor: "white" }}
                onPress={() => router.navigate("/map")}
              />
            }
          />
        </Pressable>
        <Divider />
        {searchState.searchString ? (
          <SearchWithResults
            data={searchState.searchData}
            searchString={searchState.searchString}
          />
        ) : (
          <SearchEmptyState data={data} />
        )}
      </ScreenLayout>
    </>
  );
}
