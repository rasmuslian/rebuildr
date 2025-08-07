import { View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import TopBar from "@components/navigation/top-bar";
import Hero from "@components/hero/hero";

export default function Landing() {
  const colors = useThemeColor();

  return (
    <View
      style={{
        backgroundColor: colors.background.neutral,
      }}
    >
      <TopBar />
      <Hero />
    </View>
  );
}
