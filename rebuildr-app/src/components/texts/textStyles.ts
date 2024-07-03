import { TextStyle } from "react-native";

const titleBase: TextStyle = {
  fontWeight: "500",
};

const textBase: TextStyle = {
  fontWeight: "400",
};

export const textStyles = {
  title: {
    large: {
      ...titleBase,
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: -0.32,
    },
    medium: {
      ...titleBase,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.32,
    },
    small: {
      ...titleBase,
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: -0.2,
    },
  },
  headline: {
    default: {
      ...titleBase,
      fontSize: 32,
      lineHeight: 59,
      letterSpacing: -0.2,
    },
    sub: {
      ...titleBase,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.16,
    },
    button: {
      ...titleBase,
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: -0.2,
      textTransform: "uppercase",
    },
  },
  body: {
    default: {
      ...textBase,
      fontSize: 14,
      lineHeight: 22,
      letterSpacing: 0,
    },
    small: {
      ...textBase,
      fontSize: 12,
      lineHeight: 20,
      letterSpacing: -0.16,
    },
  },
} as const;

export type TextTypes = keyof typeof textStyles;
export type TitleSize = keyof typeof textStyles.title;
export type HeadlineSize = keyof typeof textStyles.headline;
export type BodySize = keyof typeof textStyles.body;
