import React from "react";
import { TextProps, Text, TextStyle } from "react-native";
import { BodySize, HeadlineSize, textStyles, TitleSize } from "./textStyles";

type Props = TextProps;

type TitleProps = { size?: TitleSize } & Props;
type HeadlineProps = { size?: HeadlineSize } & Props;
type BodyProps = { size?: BodySize } & Props;

const Base = ({ textStyle, ...props }: Props & { textStyle: TextStyle }) => {
  return <Text {...props} style={[textStyle, props.style]} />;
};

export const Title = ({ size = "medium", ...props }: TitleProps) => (
  <Base {...props} textStyle={textStyles.title[size]} />
);

export const Headline = ({ size = "default", ...props }: HeadlineProps) => {
  return <Base {...props} textStyle={textStyles.headline[size]} />;
};

export const Body = ({ size = "default", ...props }: BodyProps) => {
  return <Base {...props} textStyle={textStyles.body[size]} />;
};
