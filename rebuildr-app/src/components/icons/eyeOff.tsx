import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const EyeOff = (props: IconProps) => (
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
      d="M16.455 16.455A7.553 7.553 0 0 1 12 18c-5.25 0-8.25-6-8.25-6a13.837 13.837 0 0 1 3.795-4.455m2.88-1.365A6.84 6.84 0 0 1 12 6c5.25 0 8.25 6 8.25 6a13.879 13.879 0 0 1-1.62 2.393m-5.04-.803a2.25 2.25 0 1 1-3.18-3.18M3.75 3.75l16.5 16.5"
    />
  </Svg>
);
