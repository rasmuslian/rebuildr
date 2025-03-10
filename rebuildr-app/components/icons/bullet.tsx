import Svg, { Circle } from "react-native-svg";
import { IconProps } from "./icon";

export const Bullet = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Circle cx={12} cy={12} r={3} fill={props.color} />
  </Svg>
);
