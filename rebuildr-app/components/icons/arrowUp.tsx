import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const ArrowUp = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 11 15"
    {...props}
  >
    <Path
      fill={props.color}
      d="M11 5.74102L5.5 0L0 5.74102H3.46701V15H7.53299V5.74102H11Z"
    />
  </Svg>
);
