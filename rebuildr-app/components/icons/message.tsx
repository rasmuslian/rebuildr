import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Message = (props: IconProps) => (
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
      d="M13.469 14.505H8.198M15.802 9.495H8.198M2.858 8.858a6 6 0 0 1 6-6h6.284a6 6 0 0 1 6 6v6.284a6 6 0 0 1-6 6H2.857V8.857Z"
    />
  </Svg>
);
