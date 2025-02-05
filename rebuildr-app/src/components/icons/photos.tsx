import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Photos = (props: IconProps) => (
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
      d="M12.311 3.756 3.128 5.563a1.337 1.337 0 0 0-1.053 1.57l1.806 9.183a1.337 1.337 0 0 0 1.57 1.054l9.183-1.807a1.337 1.337 0 0 0 1.054-1.57L13.881 4.81a1.337 1.337 0 0 0-1.57-1.054Z"
    />
    <Path
      fill={props.color}
      d="M6.33 10.06a1.396 1.396 0 1 0-.54-2.74 1.396 1.396 0 0 0 .54 2.74Z"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="m15.172 11.37-3.925-2.635-5.796 8.635M12 18.566l4.86 1.952a1.337 1.337 0 0 0 1.74-.743l3.487-8.685a1.337 1.337 0 0 0-.742-1.739l-4.433-1.78"
    />
  </Svg>
);
