import { SvgProps } from "react-native-svg";
import { Sparkle } from "./sparkle";
import { Bathtub } from "./bathtub";
import { Bricks } from "./bricks";
import { Door } from "./door";
import { Drill } from "./drill";
import { GiveAway } from "./giveAway";
import React from "react";
import { Interior } from "./interior";
import { MaterialStone } from "./materialStone";
import { Nails } from "./nails";
import { Paint } from "./paint";
import { PowerOutlet } from "./powerOutlet";
import { Roof } from "./roof";
import { Season } from "./season";
import { Tree } from "./tree";
import { WheelBarrow } from "./wheelBarrow";
import { Window } from "./window";
import { TextTokens } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";

export type PictogramType =
  | "sparkle"
  | "season"
  | "giveAway"
  | "wheelBarrow"
  | "drill"
  | "tree"
  | "powerOutlet"
  | "bathtub"
  | "door"
  | "roof"
  | "nails"
  | "paint"
  | "interior"
  | "materialStone"
  | "window"
  | "bricks";

type SizeType = "small" | "large";

export interface PictogramProps extends SvgProps {
  type: SizeType;
  size: number;
}

interface BasePictogramProps extends SvgProps {
  type?: SizeType;
  size?: number;
  color?: keyof TextTokens;
}

export const Pictogram = ({
  pictorgram,
  type = "small",
  color: colorToken = "primaryDark",
  ...props
}: BasePictogramProps & {
  pictorgram: PictogramType;
  color?: keyof TextTokens;
}) => {
  const colors = useThemeColor();
  const color = colors.text[colorToken];
  const _size = props.size ?? type === "small" ? 24 : 48;

  switch (pictorgram) {
    case "bathtub":
      return <Bathtub {...props} size={_size} color={color} type={type} />;
    case "bricks":
      return <Bricks {...props} size={_size} color={color} type={type} />;
    case "door":
      return <Door {...props} size={_size} color={color} type={type} />;
    case "drill":
      return <Drill {...props} size={_size} color={color} type={type} />;
    case "giveAway":
      return <GiveAway {...props} size={_size} color={color} type={type} />;
    case "interior":
      return <Interior {...props} size={_size} color={color} type={type} />;
    case "materialStone":
      return (
        <MaterialStone {...props} size={_size} color={color} type={type} />
      );
    case "nails":
      return <Nails {...props} size={_size} color={color} type={type} />;
    case "paint":
      return <Paint {...props} size={_size} color={color} type={type} />;
    case "powerOutlet":
      return <PowerOutlet {...props} size={_size} color={color} type={type} />;
    case "roof":
      return <Roof {...props} size={_size} color={color} type={type} />;
    case "season":
      return <Season {...props} size={_size} color={color} type={type} />;
    case "sparkle":
      return <Sparkle {...props} size={_size} color={color} type={type} />;
    case "tree":
      return <Tree {...props} size={_size} color={color} type={type} />;
    case "wheelBarrow":
      return <WheelBarrow {...props} size={_size} color={color} type={type} />;
    case "window":
      return <Window {...props} size={_size} color={color} type={type} />;
  }
  return null;
};
