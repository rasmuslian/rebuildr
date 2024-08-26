import { useContext } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import {
  MediaBreakPoints,
  ScreenDimensionsContext,
} from "src/contexts/screenDimensionsContext";

type ResponsiveStyle<T> = {
  // eslint-disable-next-line no-unused-vars
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle | ResponsiveStyleType;
};

export type ResponsiveStyleType = {
  // eslint-disable-next-line no-unused-vars
  [key in keyof MediaBreakPoints]?: ViewStyle | TextStyle | ImageStyle;
};

export const useResponsiveStyle = (
  responsiveStyle: (ViewStyle | TextStyle | ImageStyle) & ResponsiveStyleType,
) => {
  const breakPoint = useContext(ScreenDimensionsContext);

  return mergeStyles(responsiveStyle, breakPoint);
};

export const useResponsiveStyles = <
  T extends ResponsiveStyle<T> | ResponsiveStyle<any>,
>(
  responsiveStyle: T & ResponsiveStyle<any>,
) => {
  const breakPoint = useContext(ScreenDimensionsContext);

  return Object.keys(responsiveStyle).reduce(
    (mergedStyle, styleClassName) => {
      return {
        ...mergedStyle,
        [styleClassName]: mergeStyles(mergedStyle[styleClassName], breakPoint),
      };
    },
    { ...responsiveStyle },
  );
};

const mergeStyles = (
  unmergedStyle: (ViewStyle | TextStyle | ImageStyle) & ResponsiveStyleType,
  breakPoint: keyof MediaBreakPoints,
) => {
  if (breakPoint === "large") {
    return { ...unmergedStyle, ...unmergedStyle["large"] };
  }
  if (breakPoint === "medium") {
    return {
      ...unmergedStyle,
      ...unmergedStyle["large"],
      ...unmergedStyle["medium"],
    };
  }
  if (breakPoint === "small") {
    return {
      ...unmergedStyle,
      ...unmergedStyle["large"],
      ...unmergedStyle["medium"],
      ...unmergedStyle["small"],
    };
  }
  if (breakPoint === "mobile") {
    return {
      ...unmergedStyle,
      ...unmergedStyle["large"],
      ...unmergedStyle["medium"],
      ...unmergedStyle["small"],
      ...unmergedStyle["mobile"],
    };
  }
  return unmergedStyle;
};
