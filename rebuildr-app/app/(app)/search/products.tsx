import { dividerStyles } from "@components/dividers/divider";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { Display } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

export default function Products() {
  const { searchString } = useLocalSearchParams<{ searchString: string }>();

  const colors = useThemeColor();

  return (
    <ScreenLayout
      headerComponent={
        <View style={[{ marginBottom: 24, gap: 16 }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
            }}
          >
            <SearchBar
              style={{ flex: 1 }}
              placeholder="Vad letar du efter?"
              onFocus={() => router.navigate("/(app)/search")}
              onPressArrow={() =>
                router.canGoBack() ? router.back() : router.navigate("/")
              }
            />
          </View>
        </View>
      }
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Display size="small">“</Display>
          <Display size="small" numberOfLines={1} ellipsizeMode="tail">
            {searchString}
          </Display>
          <Display size="small">“</Display>
        </View>
      </View>
    </ScreenLayout>
  );
}
