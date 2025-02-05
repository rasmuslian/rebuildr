import React from "react";
import { SvgProps } from "react-native-svg";
import { DownChevronIcon } from "./downChevronIcon";
import { GiftIcon } from "./giftIcon";
import { LeftChevronIcon } from "./leftChevronIcon";
import { PersonIcon } from "./personIcon";
import { PinIcon } from "./pinIcon";
import { PointUpIcon } from "./pointUpIcon";
import { RightChevronIcon } from "./rightChevronIcon";
import { SeasonIcon } from "./seasonIcon";
import { CrossHairIcon } from "./crossHairIcon";
import { WoodIcon } from "./woodIcon";
import { DoorIcon } from "./doorIcon";
import { WindowIcon } from "./windowIcon";
import { FloorIcon } from "./floorIcon";
import { InteriorIcon } from "./interiorIcon";
import { PaintIcon } from "./paintIcon";
import { FastenersIcon } from "./fastenersIcon";
import { RoofIcon } from "./roofIcon";
import { TilesIcon } from "./tilesIcon";
import { BathtubIcon } from "./bathtubIcon";
import { OutletIcon } from "./outletIcon";
import { TreeIcon } from "./treeIcon";
import { DrillIcon } from "./drillIcon";
import { WheelbarrowIcon } from "./wheelbarrowIcon";
import { MaterialIcon } from "./materialIcon";

export type IconType =
  | "Person"
  | "Pin"
  | "LeftChevron"
  | "RightChevron"
  | "PointUp"
  | "Material"
  | "Season"
  | "Gift"
  | "DownChevron"
  | "CrossHair"
  | "Wood"
  | "Door"
  | "Window"
  | "Floor"
  | "Interior"
  | "Paint"
  | "Fasteners"
  | "Roof"
  | "Tiles"
  | "Bathtub"
  | "Outlet"
  | "Tree"
  | "Drill"
  | "Wheelbarrow";

export interface IconProps extends SvgProps {
  height?: number;
  width?: number;
  color?: string;
}

export const Icon = ({ icon, ...props }: IconProps & { icon: IconType }) => {
  switch (icon) {
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
    case "Material":
      return <MaterialIcon {...props} />;
    case "Season":
      return <SeasonIcon {...props} />;
    case "Gift":
      return <GiftIcon {...props} />;
    case "DownChevron":
      return <DownChevronIcon {...props} />;
    case "CrossHair":
      return <CrossHairIcon {...props} />;
    case "Wood":
      return <WoodIcon {...props} />;
    case "Door":
      return <DoorIcon {...props} />;
    case "Window":
      return <WindowIcon {...props} />;
    case "Floor":
      return <FloorIcon {...props} />;
    case "Interior":
      return <InteriorIcon {...props} />;
    case "Paint":
      return <PaintIcon {...props} />;
    case "Fasteners":
      return <FastenersIcon {...props} />;
    case "Roof":
      return <RoofIcon {...props} />;
    case "Tiles":
      return <TilesIcon {...props} />;
    case "Bathtub":
      return <BathtubIcon {...props} />;
    case "Outlet":
      return <OutletIcon {...props} />;
    case "Tree":
      return <TreeIcon {...props} />;
    case "Drill":
      return <DrillIcon {...props} />;
    case "Wheelbarrow":
      return <WheelbarrowIcon {...props} />;
    default:
      break;
  }

  return null;
};
