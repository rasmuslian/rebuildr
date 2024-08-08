import React from "react";
import { SvgProps } from "react-native-svg";
import { LeftChevronIcon } from "./leftChevronIcon";
import { PersonIcon } from "./personIcon";
import { PinIcon } from "./pinIcon";
import { PointUpIcon } from "./pointUpIcon";
import { RightChevronIcon } from "./rightChevronIcon";
import { TilesIcon } from "./tilesIcon";

export type IconType =
  | "Person"
  | "Pin"
  | "LeftChevron"
  | "RightChevron"
  | "PointUpIcon"
  | "TilesIcon";

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
    case "LeftChevron":
      return <LeftChevronIcon {...props} />;
    case "RightChevron":
      return <RightChevronIcon {...props} />;
    case "PointUpIcon":
      return <PointUpIcon {...props} />;
    case "TilesIcon":
      return <TilesIcon {...props} />;
    default:
      break;
  }

  return null;
};
