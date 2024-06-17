import React from "react";
import { SvgProps } from "react-native-svg";
import { PersonIcon } from "./personIcon";

export type IconType = "Person";

export interface IconProps extends SvgProps {
  height?: number;
  width?: number;
  color?: string;
}

export const Icon = ({
  iconType,
  ...props
}: IconProps & { iconType: IconType }) => {
  switch (iconType) {
    case "Person":
      return <PersonIcon {...props} />;
    default:
      break;
  }

  return null;
};
