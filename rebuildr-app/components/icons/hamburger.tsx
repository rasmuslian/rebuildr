import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Hamburger = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path stroke={props.color} strokeWidth={1.9} d="M0 9h24M0 17.764h24" />
  </Svg>
);
