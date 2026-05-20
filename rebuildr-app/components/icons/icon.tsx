import React from "react";
import { SvgProps } from "react-native-svg";
import { Placeholder } from "./placeholder";
import { Check } from "./check";
import { ChevronLeft } from "./chevronLeft";
import { ChevronRight } from "./chevronRight";
import { ChevronUp } from "./chevronUp";
import { ChevronDown } from "./chevronDown";
import { X } from "./x";
import { Bullet } from "./bullet";
import { Eye } from "./eye";
import { EyeOff } from "./eyeOff";
import { ArrowLeft } from "./arrowLeft";
import { ArrowRight } from "./arrowRight";
import { FilterList } from "./filterList";
import { Heart } from "./heart";
import { HeartFilled } from "./heartFilled";
import { List } from "./list";
import { Grid } from "./grid";
import { Map } from "./map";
import { Location } from "./location";
import { Sort } from "./sort";
import { Reset } from "./reset";
import { Drag } from "./drag";
import { AddImage } from "./addImage";
import { FilterList2 } from "./filterList2";
import { Search } from "./search";
import { AddPhoto } from "./addPhoto";
import { Photos } from "./photos";
import { Plus } from "./plus";
import { Trash } from "./trash";
import { Upload } from "./upload";
import { Download } from "./download";
import { Kebab } from "./kebab";
import { ArrowUp } from "./arrowUp";
import { AddFile } from "./addFile";
import { User } from "./user";
import { Message } from "./message";
import { NewListing } from "./newListing";
import { Categories } from "./categories";
import { File } from "./file";
import { Star } from "./star";
import { TextTokens } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";
import { Home } from "./home";
import { Edit } from "./edit";
import { Hamburger } from "./hamburger";
import { Instagram } from "./instagram";
import { Substack } from "./substack";
import { Linkedin } from "./linkedin";
import { QrCode } from "./qrCode";
import { Heart2 } from "./heart2";
import { Heart2Filled } from "./heart2Filled";
import { Paperclip } from "./paperclip";
import { Minus } from "./minus";
import { Navigation } from "./navigation";
import { Magic } from "./magic";
import { Receipt } from "./receipt";

export type IconType =
  | "placeholder"
  | "check"
  | "chevronLeft"
  | "chevronRight"
  | "chevronUp"
  | "chevronDown"
  | "X"
  | "bullet"
  | "edit"
  | "eye"
  | "eyeOff"
  | "arrowLeft"
  | "arrowRight"
  | "filterList"
  | "heart"
  | "heartFilled"
  | "heart2"
  | "heart2Filled"
  | "hamburger"
  | "instagram"
  | "substack"
  | "linkedin"
  | "home"
  | "list"
  | "grid"
  | "map"
  | "location"
  | "sort"
  | "reset"
  | "drag"
  | "addImage"
  | "filterList2"
  | "search"
  | "addPhoto"
  | "photos"
  | "+"
  | "-"
  | "navigation"
  | "trash"
  | "upload"
  | "download"
  | "kebab"
  | "arrowUp"
  | "file"
  | "addFile"
  | "user"
  | "message"
  | "newListing"
  | "categories"
  | "qrCode"
  | "star"
  | "paperclip"
  | "magic"
  | "receipt";

export interface IconProps extends SvgProps {
  size: number;
}

export interface BaseIconProps extends SvgProps {
  size?: number;
  color?: keyof TextTokens;
  customColor?: string;
  strokeColor?: keyof TextTokens;
  opacity?: string;
}
export const Icon = ({
  icon,
  color: colorToken = "primaryDark",
  customColor,
  strokeColor,
  opacity = "",
  ...props
}: BaseIconProps & { icon: IconType }) => {
  const colors = useThemeColor();
  const color = (customColor ?? colors.text[colorToken]) + opacity;
  const size = props.size ?? 24;

  switch (icon) {
    case "placeholder":
      return <Placeholder {...props} size={size} color={color} />;
    case "check":
      return <Check {...props} size={size} color={color} />;
    case "chevronLeft":
      return <ChevronLeft {...props} size={size} color={color} />;
    case "chevronRight":
      return <ChevronRight {...props} size={size} color={color} />;
    case "chevronUp":
      return <ChevronUp {...props} size={size} color={color} />;
    case "chevronDown":
      return <ChevronDown {...props} size={size} color={color} />;
    case "X":
      return <X {...props} size={size} color={color} />;
    case "bullet":
      return <Bullet {...props} size={size} color={color} />;
    case "edit":
      return <Edit {...props} size={size} color={color} />;
    case "eye":
      return <Eye {...props} size={size} color={color} />;
    case "eyeOff":
      return <EyeOff {...props} size={size} color={color} />;
    case "arrowLeft":
      return <ArrowLeft {...props} size={size} color={color} />;
    case "arrowRight":
      return <ArrowRight {...props} size={size} color={color} />;
    case "filterList":
      return <FilterList {...props} size={size} color={color} />;
    case "heart": {
      const _strokeColor = strokeColor ? colors.text[strokeColor] : color;
      return (
        <Heart
          {...props}
          size={size}
          color={color}
          style={props.style}
          strokeColor={_strokeColor}
        />
      );
    }
    case "heartFilled": {
      const _strokeColor = strokeColor ? colors.text[strokeColor] : color;
      return (
        <HeartFilled
          {...props}
          size={size}
          color={color}
          style={props.style}
          strokeColor={_strokeColor}
        />
      );
    }
    case "heart2": {
      const _strokeColor = strokeColor ? colors.text[strokeColor] : color;
      return (
        <Heart2
          strokeColor={_strokeColor}
          {...props}
          size={size}
          color={color}
        />
      );
    }
    case "heart2Filled": {
      const _strokeColor = strokeColor ? colors.text[strokeColor] : color;
      return (
        <Heart2Filled
          strokeColor={_strokeColor}
          {...props}
          size={size}
          color={color}
        />
      );
    }
    case "home":
      return <Home {...props} size={size} color={color} />;
    case "list":
      return <List {...props} size={size} color={color} />;
    case "grid":
      return <Grid {...props} size={size} color={color} />;
    case "map":
      return <Map {...props} size={size} color={color} />;
    case "location":
      return <Location {...props} size={size} color={color} />;
    case "sort":
      return <Sort {...props} size={size} color={color} />;
    case "reset":
      return <Reset {...props} size={size} color={color} />;
    case "drag":
      return <Drag {...props} size={size} color={color} />;
    case "addImage":
      return <AddImage {...props} size={size} color={color} />;
    case "filterList2":
      return <FilterList2 {...props} size={size} color={color} />;
    case "search":
      return <Search {...props} size={size} color={color} />;
    case "addPhoto":
      return <AddPhoto {...props} size={size} color={color} />;
    case "photos":
      return <Photos {...props} size={size} color={color} />;
    case "+":
      return <Plus {...props} size={size} color={color} />;
    case "-":
      return <Minus {...props} size={size} color={color} />;
    case "navigation":
      return <Navigation {...props} size={size} color={color} />;
    case "trash":
      return <Trash {...props} size={size} color={color} />;
    case "upload":
      return <Upload {...props} size={size} color={color} />;
    case "download":
      return <Download {...props} size={size} color={color} />;
    case "kebab":
      return <Kebab {...props} size={size} color={color} />;
    case "arrowUp":
      return <ArrowUp {...props} size={size} color={color} />;
    case "file":
      return <File {...props} size={size} color={color} />;
    case "addFile":
      return <AddFile {...props} size={size} color={color} />;
    case "user":
      return <User {...props} size={size} color={color} />;
    case "hamburger":
      return <Hamburger {...props} size={size} color={color} />;
    case "instagram":
      return <Instagram {...props} size={size} color={color} />;
    case "substack":
      return <Substack {...props} size={size} color={color} />;
    case "linkedin":
      return <Linkedin {...props} size={size} color={color} />;
    case "message":
      return <Message {...props} size={size} color={color} />;
    case "newListing":
      return <NewListing {...props} size={size} color={color} />;
    case "categories":
      return <Categories {...props} size={size} color={color} />;
    case "qrCode":
      return <QrCode {...props} size={size} color={color} />;
    case "star":
      return <Star {...props} size={size} color={color} />;
    case "paperclip":
      return <Paperclip {...props} size={size} color={color} />;
    case "magic":
      return <Magic {...props} size={size} color={color} />;
    case "receipt":
      return <Receipt {...props} size={size} color={color} />;
    default:
      break;
  }

  return null;
};
