import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const NewListing = (props: IconProps) => (
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
      d="M9.069 21.14H5.907a3.047 3.047 0 0 1-3.047-3.047V5.907A3.047 3.047 0 0 1 5.907 2.86h12.186a3.047 3.047 0 0 1 3.047 3.047v3.249"
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M15.21 21.14a5.93 5.93 0 1 0 0-11.86 5.93 5.93 0 0 0 0 11.86ZM15.21 12.987v4.447M12.987 15.21h4.447"
    />
  </Svg>
);
