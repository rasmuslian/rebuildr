import React from "react";
import { SvgProps } from "react-native-svg";
import { GiftIcon } from "./giftIcon";
import { LeftChevronIcon } from "./leftChevronIcon";
import { PersonIcon } from "./personIcon";
import { PinIcon } from "./pinIcon";
import { PointUpIcon } from "./pointUpIcon";
import { RightChevronIcon } from "./rightChevronIcon";
import { SeasonIcon } from "./seasonIcon";
import { TilesIcon } from "./tilesIcon";

export type IconType =
  | "Person"
  | "Pin"
  | "LeftChevron"
  | "RightChevron"
  | "PointUp"
  | "Tiles"
  | "Season"
  | "Gift";

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
    case "PointUp":
      return <PointUpIcon {...props} />;
    case "Tiles":
      return <TilesIcon {...props} />;
    case "Season":
      return <SeasonIcon {...props} />;
    case "Gift":
      return <GiftIcon {...props} />;
    default:
      break;
  }

  return null;
};
