import {
  SearchInSeasonQuery,
  SearchInSeasonQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { CategorySection } from "@components/sections/category-section";
import { Display } from "@components/typography/text";
import { permanentSection } from "@constants/permanent-sections";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { View } from "react-native";

const SEARCH_IN_SEASON = gql`
  query SearchInSeason($input: CategoriesInput!) {
    categories(input: $input) {
      id
      name
      parentId
      children {
        id
        parentId
      }
    }
  }
`;

export default function InSeasonPage() {
  const { isDesktop } = useScreenType();
  const { data, loading } = useQuery<
    SearchInSeasonQuery,
    SearchInSeasonQueryVariables
  >(SEARCH_IN_SEASON, {
    variables: {
      input: {
        seasonalCategories: true,
      },
    },
  });

  return (
    <ScreenLayout
      loading={loading}
      style={{ marginTop: 24 }}
      headerComponent={
        isDesktop ? (
          <TopBar showFor={["desktop"]} theme="light" />
        ) : (
          <SearchBar
            onPressArrow={() => router.navigate("/")}
            placeholder="Vad letar du efter?"
            searchOnSubmit
          />
        )
      }
      desktopFooter={isDesktop}
    >
      <View
        style={{
          marginBottom: 24,
        }}
      >
        <Display size="small">{permanentSection.forTheSeason.title}</Display>
      </View>
      <View style={{ gap: 16 }}>
        {data?.categories.map((c, i) => (
          <CategorySection category={c} key={i} />
        ))}
      </View>
    </ScreenLayout>
  );
}
