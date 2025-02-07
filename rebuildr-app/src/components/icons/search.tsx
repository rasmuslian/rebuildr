import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Search = (props: IconProps) => (
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
      d="M11 19.056a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21.056l-4.35-4.35"
    />
  </Svg>
);
