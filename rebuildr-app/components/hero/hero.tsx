import { View, ImageBackground } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Headline } from "@components/typography/text";
import { SearchBar } from "@components/search/search-bar";
import { useDebounceCallback } from "usehooks-ts";

export default function Hero() {
  const colors = useThemeColor();

  const onChangeText = useDebounceCallback((value) => {
    // TODO: Call api endpoint.
    console.log("value :>> ", value);
  }, 400);

  return (
    <ImageBackground
      source={require("@assets/images/main-background.png")}
      resizeMode="cover"
      style={{
        backgroundColor: colors.logo.vector,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingVertical: 24,
          paddingHorizontal: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Headline style={{ color: colors.logo.background }}>
          Sveriges marknadsplats för återbrukat byggmaterial
        </Headline>

        <SearchBar
          style={{ borderBottomWidth: 0 }}
          placeholder="Vad letar du efter? "
          onChange={onChangeText}
        />
      </View>
    </ImageBackground>
  );
}
