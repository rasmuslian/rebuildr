import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Reset = (props: IconProps) => (
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
      d="m9.001 22.53-5.539-5.539 5.54-5.54"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M3.462 16.99h12.076a5 5 0 0 0 5-5V7.493a5 5 0 0 0-5-5H8.462a5 5 0 0 0-5 5v1.805"
    />
  </Svg>
);
