import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Paperclip = (props: IconProps) => (
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
      strokeWidth={2}
      d="m20.965 11.407-8.477 8.477a5.537 5.537 0 0 1-7.831-7.832l8.477-8.476a3.692 3.692 0 0 1 5.22 5.22l-8.486 8.477a1.846 1.846 0 0 1-2.61-2.61L15.09 6.84"
    />
  </Svg>
);
