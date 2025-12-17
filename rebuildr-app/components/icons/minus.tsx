import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Minus = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.485 12.056H3.515"
    />
  </Svg>
);
