import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Categories = (props: IconProps) => (
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
      d="M9.167 3.75H4.75a1 1 0 0 0-1 1v4.417a1 1 0 0 0 1 1h4.417a1 1 0 0 0 1-1V4.75a1 1 0 0 0-1-1ZM16.335 3.42 13.503 6.25a1 1 0 0 0 0 1.414l2.832 2.832a1 1 0 0 0 1.414 0l2.832-2.832a1 1 0 0 0 0-1.414L17.749 3.42a1 1 0 0 0-1.414 0ZM19.25 13.833h-4.417a1 1 0 0 0-1 1v4.417a1 1 0 0 0 1 1h4.417a1 1 0 0 0 1-1v-4.417a1 1 0 0 0-1-1ZM9.167 13.833H4.75a1 1 0 0 0-1 1v4.417a1 1 0 0 0 1 1h4.417a1 1 0 0 0 1-1v-4.417a1 1 0 0 0-1-1Z"
    />
  </Svg>
);
