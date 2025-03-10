import Svg, { Circle, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const FilterList2 = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Circle
      cx={6.78}
      cy={6.896}
      r={3.829}
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      transform="rotate(-90 6.78 6.896)"
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M10.61 6.896h10.492"
    />
    <Circle
      cx={3.829}
      cy={3.829}
      r={3.829}
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      transform="matrix(0 -1 -1 0 21.102 21.94)"
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M13.443 18.11H2.95"
    />
  </Svg>
);
