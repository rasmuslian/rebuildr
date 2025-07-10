import { View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import TopBar from "@components/navigation/top-bar";

export default function Landing() {
  const colors = useThemeColor();

  return (
    <View
      style={{
        alignItems: "center",
        gap: 16,
        backgroundColor: colors.background.neutral,
        flex: 1,
      }}
    >
      <TopBar />
    </View>
  );
}
