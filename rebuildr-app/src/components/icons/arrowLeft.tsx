import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const ArrowLeft = (props: IconProps) => (
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
      d="M19 12.028H5M12 19.028l-7-7 7-7"
    />
  </Svg>
);
