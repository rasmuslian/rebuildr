import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Sort = (props: IconProps) => (
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
      d="m12.638 18.02 4.008 4.008 4.008-4.008M16.633 22.016V11.663M3.36 6.035l4.006-4.007 4.008 4.007M7.367 2.028v10.353"
    />
  </Svg>
);
