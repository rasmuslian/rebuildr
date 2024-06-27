import React from "react";
import { SvgProps } from "react-native-svg";
import { PersonIcon } from "./personIcon";
import { PinIcon } from "./pinIcon";

export type IconType = "Person" | "Pin";

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
    case "Pin":
      return <PinIcon {...props} />;
    default:
      break;
  }

  return null;
};
