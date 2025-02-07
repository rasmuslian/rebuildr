import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const User = (props: IconProps) => (
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
      strokeWidth={1.9}
      d="M2.622 21.8a9.378 9.378 0 0 1 6.055-8.77m12.7 8.77a9.378 9.378 0 0 0-6.054-8.77"
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeWidth={1.9}
      d="M8.963 3.132a5.413 5.413 0 0 1 6.074 0c1.374.945 2.209 2.497 2.209 4.14v1.047c0 2.22-1.105 4.3-2.961 5.576a4.047 4.047 0 0 1-4.57 0c-1.856-1.276-2.96-3.356-2.96-5.576V7.272c0-1.643.834-3.195 2.208-4.14Z"
    />
  </Svg>
);
