import { TextProps, TextStyle, Text } from "react-native";
import { TextTokens } from "src/constants/colors";
import {
  BodySize,
  DisplaySize,
  HeadlineSize,
  LabelSize,
  textStyles,
  TitleSize,
} from "./typeface";
import { useResponsiveStyle } from "src/hooks/useResponsiveStyles";
import { useThemeColor } from "src/hooks/useThemeColor";

type Props = { color?: keyof TextTokens; upperCase?: boolean } & TextProps;
type DisplayProps = { size?: DisplaySize } & Props;
type HeadlineProps = { size?: HeadlineSize } & Props;
type TitleProps = { size?: TitleSize } & Props;
type LabelProps = { size?: LabelSize } & Props;
type BodyProps = { size?: BodySize } & Props;

export const Base = ({
  textStyle,
  color = "PrimaryDark",
  upperCase,
  ...props
}: Props & { textStyle: TextStyle }) => {
  const colors = useThemeColor();

  const styles = useResponsiveStyle(textStyle);

  return (
    <Text
      {...props}
      style={[
        styles,
        { color: colors.textTokens[color] },
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

export const Titleline = ({ size = "large", ...props }: TitleProps) => {
  return <Base {...props} textStyle={textStyles.title[size]} />;
};

export const Labelline = ({ size = "large", ...props }: LabelProps) => {
  return <Base {...props} textStyle={textStyles.label[size]} />;
};

export const Body = ({ size = "large", ...props }: BodyProps) => {
  return <Base {...props} textStyle={textStyles.body[size]} />;
};
