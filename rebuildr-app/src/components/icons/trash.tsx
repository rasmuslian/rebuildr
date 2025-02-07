import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Trash = (props: IconProps) => (
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
      strokeWidth={2}
      d="M3 6.056h18"
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M19 6.056v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-14m3 0v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11.056v6M14 11.056v6"
    />
  </Svg>
);
