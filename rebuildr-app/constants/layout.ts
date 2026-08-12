import { Platform, ViewStyle } from "react-native";

export const isWeb = Platform.OS === "web";

// On web the document scrolls (so the browser chrome collapses), so screen roots
// must grow with their content instead of being pinned with flex:1.
export const screenGrowStyle: ViewStyle = isWeb
  ? { flexGrow: 1, flexShrink: 0, flexBasis: "auto" }
  : { flex: 1 };

// react-native-web supports these; RN's core types don't. Web only.
export const WEB_FIXED = "fixed" as unknown as ViewStyle["position"];
export const WEB_STICKY = "sticky" as unknown as ViewStyle["position"];

// Wide screens have no natural bound, so cap the main content column and center it.
// Without this, full-bleed layouts stretch fixed-column grids until product images
// balloon on 2K/4K monitors.
export const MAX_CONTENT_WIDTH = 1600;

// Product grids size columns from a target card width instead of a fixed count, so
// cards stay ~targetWidth wide and more of them appear as the screen widens.
export const GRID_CARD = {
  targetWidth: 240,
  gap: 24,
  minColumns: 2,
  maxColumns: 6,
};
