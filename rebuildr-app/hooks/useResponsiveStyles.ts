import {
  MediaBreakPoints,
  ScreenDimensionsContext,
} from "@context/screenDimensionsContext";
import { useContext } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";

type RNStyles = ViewStyle | TextStyle | ImageStyle;

type BasicStyle<T> = {
  // eslint-disable-next-line no-unused-vars
  [P in keyof T]: RNStyles;
};
export type ResponsiveStyle<T> = {
  // eslint-disable-next-line no-unused-vars
  [P in keyof T]: RNStyles & ResponsiveStyleType;
};

export type ResponsiveStyleType = {
  // eslint-disable-next-line no-unused-vars
  [key in keyof MediaBreakPoints]?: RNStyles;
};

export const useResponsiveStyle = (
  responsiveStyle: RNStyles & ResponsiveStyleType,
) => {
  const breakPoint = useContext(ScreenDimensionsContext);

  return mergeStyles(responsiveStyle, breakPoint);
};

export const useResponsiveStyles = <
  T extends ResponsiveStyle<T> | ResponsiveStyle<any>,
>(
  responsiveStyle: T & ResponsiveStyle<any>,
): BasicStyle<T> => {
  const breakPoint = useContext(ScreenDimensionsContext);

  return Object.keys(responsiveStyle).reduce(
    (mergedStyle, styleClassName) => ({
      ...mergedStyle,
      [styleClassName]: mergeStyles(mergedStyle[styleClassName], breakPoint),
    }),
    responsiveStyle,
  );
};

const mergeStyles = (
  unmergedStyle: RNStyles & ResponsiveStyleType,
  breakPoint: keyof MediaBreakPoints,
): RNStyles => {
  if (breakPoint === "desktop") {
    return { ...unmergedStyle, ...unmergedStyle["desktop"] };
  }
  return unmergedStyle;
};
