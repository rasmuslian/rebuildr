import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const AddPhoto = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M14.82 4.662H9.222a2 2 0 0 0-1.924 1.452L6.853 7.68H4.448a1.655 1.655 0 0 0-1.655 1.655v8.568a1.655 1.655 0 0 0 1.655 1.655h14.895a1.655 1.655 0 0 0 1.655-1.655V10.509"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M11.896 15.618a2.995 2.995 0 1 0 0-5.991 2.995 2.995 0 0 0 0 5.99Z"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M22.958 4.662h-4.151M20.882 2.586v4.151"
    />
  </Svg>
);
