import { TextProps, TextStyle, Text } from "react-native";
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

type Props = {
  color?: keyof TextTokens;
  upperCase?: boolean;
  isLink?: boolean;
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
  ...props
}: Props & { textStyle: TextStyle }) => {
  const colors = useThemeColor();

  const styles = useResponsiveStyle(textStyle) as TextStyle;

  return (
    <Text
      {...props}
      style={[
        styles,
        { color: colors.text[color] },
        isLink && {
          textDecorationColor: colors.text.link,
          textDecorationLine: "underline",
          color: colors.text.link,
        },
        upperCase && { textTransform: "uppercase" },
        props.style,
      ]}
    />
  );
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
