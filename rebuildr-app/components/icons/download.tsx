import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Download = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <Path
      fill={props.color}
      d="M8 12L3 7L4.4 5.55L7 8.15V0H9V8.15L11.6 5.55L13 7L8 12ZM2 16C1.45 16 0.98 15.8 0.59 15.41C0.2 15.02 0 14.55 0 14V11H2V14H14V11H16V14C16 14.55 15.8 15.02 15.41 15.41C15.02 15.8 14.55 16 14 16H2Z"
    />
  </Svg>
);
