import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const FilterList = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M20.032 7.018H3.968M17.069 12.028H6.93M13.074 17.039h-2.147"
    />
  </Svg>
);
