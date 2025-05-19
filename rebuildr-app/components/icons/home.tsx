import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Home = (props: IconProps) => (
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
      strokeLinejoin="bevel"
      strokeWidth={2}
      d="M19.189 20c.378 0 .686-.352.686-.784V9.2a.993.993 0 0 0-.266-.64l-6.303-5.434a2 2 0 0 0-2.612 0L4.391 8.56a1.03 1.03 0 0 0-.266.64v10.016c0 .432.308.784.686.784h14.378Z"
    />
  </Svg>
);
