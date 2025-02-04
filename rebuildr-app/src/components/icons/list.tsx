import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const List = (props: IconProps) => (
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
      d="M19.25 3.778H4.75a1 1 0 0 0-1 1v4.417a1 1 0 0 0 1 1h14.5a1 1 0 0 0 1-1V4.778a1 1 0 0 0-1-1ZM19.25 13.861H4.75a1 1 0 0 0-1 1v4.417a1 1 0 0 0 1 1h14.5a1 1 0 0 0 1-1v-4.416a1 1 0 0 0-1-1Z"
    />
  </Svg>
);
