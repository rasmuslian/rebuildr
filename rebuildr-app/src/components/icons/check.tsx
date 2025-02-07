import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Check = (props: IconProps) => (
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
      strokeWidth={1.9}
      d="M20 6 9 17l-5-5"
    />
  </Svg>
);
