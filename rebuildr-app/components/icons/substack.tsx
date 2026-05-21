import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Substack = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 21 24"
    {...props}
  >
    <Path
      fill={props.color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 0H21V2.9468H0V0ZM0 10.7493H21V24L10.4977 18.1036L0 24V10.7493ZM0 5.37463H21V8.32143H0V5.37463Z"
    />
  </Svg>
);
