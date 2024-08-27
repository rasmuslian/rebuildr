import React from "react";
import { TextProps, Text, TextStyle } from "react-native";
import Colors, { TextColors } from "src/styles/colors";
import {
  ResponsiveStyleType,
  useResponsiveStyle,
} from "src/hooks/useResponsiveStyles";
import {
  BodyType,
  ButtonType,
  FooterType,
  HeadlineType,
  InputType,
  LabelType,
  textStyles,
  TitleType,
} from "./textStyles";

type Props = { color?: TextColors } & TextProps;

type TitleProps = { type?: TitleType } & Props;
type HeadlineProps = { type?: HeadlineType } & Props;
type BodyProps = { type?: BodyType } & Props;
type LabelProps = { type?: LabelType } & Props;
type ButtonProps = { type?: ButtonType } & Props;
type InputProps = { type?: InputType } & Props;
type FooterProps = { type?: FooterType } & Props;

const Base = ({
  textStyle,
  color = "primary",
  ...props
}: Props & {
  textStyle: TextStyle & ResponsiveStyleType;
}) => {
  const responsiveStyle = useResponsiveStyle(textStyle);
  return (
    <Text
      {...props}
      style={[responsiveStyle, { color: Colors.text[color] }, props.style]}
    />
  );
};

export const Headline = ({ type = "default", ...props }: HeadlineProps) => {
  return <Base {...props} textStyle={textStyles.headline[type]} />;
};

export const Title = ({ type = "default", ...props }: TitleProps) => (
  <Base {...props} textStyle={textStyles.title[type]} />
);

export const Body = ({ type = "default", ...props }: BodyProps) => {
  return <Base {...props} textStyle={textStyles.body[type]} />;
};

export const Label = ({ type = "default", ...props }: LabelProps) => {
  return <Base {...props} textStyle={textStyles.label[type]} />;
};
export const ButtonText = ({ type = "default", ...props }: ButtonProps) => {
  return <Base {...props} textStyle={textStyles.button[type]} />;
};
export const InputText = ({ type = "default", ...props }: InputProps) => {
  return <Base {...props} textStyle={textStyles.input[type]} />;
};
export const FooterText = ({ type = "default", ...props }: FooterProps) => {
  return <Base {...props} textStyle={textStyles.footer[type]} />;
};
