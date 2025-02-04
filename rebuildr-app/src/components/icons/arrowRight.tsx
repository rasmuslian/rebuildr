import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const ArrowRight = (props: IconProps) => (
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
      d="M5 12.028h14M12 19.028l7-7-7-7"
    />
  </Svg>
);
