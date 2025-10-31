/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { themeColorTokens } from "@constants/colors";
// import { useColorScheme } from "react-native";

export function useThemeColor(inputTheme?: "light" | "dark") {
  // const theme = useColorScheme() ?? "light";
  const theme = inputTheme ?? "light";

  return themeColorTokens[theme];
}
