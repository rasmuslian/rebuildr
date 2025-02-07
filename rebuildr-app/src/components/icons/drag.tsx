import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Drag = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      vectorEffect="non-scaling-stroke"
      fill={props.color}
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M8.5 13.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM15.5 13.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8.5 6.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM15.5 6.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8.5 20.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM15.5 20.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  </Svg>
);
