/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from "react-native";
import { themeColorTokens } from "src/constants/colors";

export function useThemeColor() {
  const theme = useColorScheme() ?? "light";

  return themeColorTokens[theme];
}
