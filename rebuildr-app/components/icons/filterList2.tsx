import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const FilterList2 = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <Ellipse
      cx={5.08545}
      cy={5.12988}
      rx={2.87208}
      ry={2.87207}
      transform="rotate(-90 5.08545 5.12988)"
      stroke="#1E1E1E"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.95752 5.12988L15.8264 5.12988"
      stroke="#1E1E1E"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={2.87207}
      cy={2.87207}
      r={2.87207}
      transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 15.8262 16.4126)"
      stroke="#1E1E1E"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.082 13.5405L2.21314 13.5405"
      stroke="#1E1E1E"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);