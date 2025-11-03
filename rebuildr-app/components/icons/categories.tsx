import Svg, { Circle } from "react-native-svg";
import { IconProps } from "./icon";

export const Categories = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Circle cx="6.5" cy="6.5" r="3.55" stroke={props.color} strokeWidth="1.9" />
    <Circle
      cx="17.5"
      cy="6.5"
      r="3.55"
      stroke={props.color}
      strokeWidth="1.9"
    />
    <Circle
      cx="6.5"
      cy="17.5"
      r="3.55"
      stroke={props.color}
      strokeWidth="1.9"
    />
    <Circle
      cx="17.5"
      cy="17.5"
      r="3.55"
      stroke={props.color}
      strokeWidth="1.9"
    />
  </Svg>
);
