import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const AddFile = (props: IconProps) => (
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
      d="M22.531 19.924H18.38M20.456 17.849V22M15.456 22h-9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l7 7v5"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.456 2v7h7"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M8.229 16.856h7.542M8.229 13.242h7.542M8.229 9.629h1.875"
    />
  </Svg>
);
