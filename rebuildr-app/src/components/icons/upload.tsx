import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Upload = (props: IconProps) => (
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
      d="M21 15.056v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8.056l-5-5-5 5M12 3.056v12"
    />
  </Svg>
);
