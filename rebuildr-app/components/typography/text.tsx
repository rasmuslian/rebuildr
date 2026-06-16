import { TextProps, TextStyle, Text, Platform } from "react-native";
import {
  BodySize,
  DisplaySize,
  HeadlineSize,
  LabelSize,
  textStyles,
  TitleSize,
} from "./typeface";
import { TextTokens } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";
import { useResponsiveStyle } from "@hooks/useResponsiveStyles";
import { Href, Link } from "expo-router";

type Props = {
  color?: keyof TextTokens;
  upperCase?: boolean;
  isLink?: boolean;
  link?: Href;
  /**
   * Renders the text as a semantic heading. On web this emits
   * role="heading" + aria-level (RN Web has no real <hN>, but Google treats
   * role=heading/aria-level=1 as an H1-equivalent); on native it sets the
   * "header" accessibility role for screen readers.
   */
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
} & TextProps;
type DisplayProps = { size?: DisplaySize } & Props;
type HeadlineProps = { size?: HeadlineSize } & Props;
type TitleProps = { size?: TitleSize } & Props;
type LabelProps = { size?: LabelSize } & Props;
type BodyProps = { size?: BodySize } & Props;

export const Base = ({
  textStyle,
  color = "primaryDark",
  upperCase,
  isLink,
  link,
  heading,
  ...props
}: Props & { textStyle: TextStyle }) => {
  const colors = useThemeColor();

  const styles = useResponsiveStyle(textStyle) as TextStyle;

  const headingProps = heading
    ? Platform.OS === "web"
      ? ({ role: "heading", "aria-level": heading } as const)
      : ({ accessibilityRole: "header" } as const)
    : {};

  const textComponent = (
    <Text
      {...props}
      {...headingProps}
      style={[
        styles,
        { color: colors.text[color] },
        (isLink || props.onPress || !!link) && {
          textDecorationColor: colors.text.link,
          textDecorationLine: "underline",
          color: colors.text.link,
        },
        upperCase && { textTransform: "uppercase" },
        props.style,
      ]}
    />
  );
  if (link) {
    return <Link href={link}>{textComponent}</Link>;
  }
  return textComponent;
};
export const Display = ({ size = "large", ...props }: DisplayProps) => {
  return <Base {...props} textStyle={textStyles.display[size]} />;
};

export const Headline = ({ size = "large", ...props }: HeadlineProps) => {
  return <Base {...props} textStyle={textStyles.headline[size]} />;
};

export const Title = ({ size = "large", ...props }: TitleProps) => {
  return <Base {...props} textStyle={textStyles.title[size]} />;
};

export const Label = ({ size = "large", ...props }: LabelProps) => {
  return <Base {...props} textStyle={textStyles.label[size]} />;
};

export const Body = ({ size = "large", ...props }: BodyProps) => {
  return <Base {...props} textStyle={textStyles.body[size]} />;
};
