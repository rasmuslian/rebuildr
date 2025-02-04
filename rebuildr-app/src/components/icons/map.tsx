import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Map = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.width}
    viewBox="0 0 24 25"
    fill="none"
    {...props}
  >
    <G
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      clipPath="url(#a)"
    >
      <Path d="M1.916 6.528v14.667l6.417-3.667 7.333 3.667 6.417-3.667V2.861l-6.417 3.667-7.333-3.667-6.417 3.667ZM8.333 2.861v14.667M15.666 6.528v14.667" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill={props.color} d="M1 1.028h22v22H1z" />
      </ClipPath>
    </Defs>
  </Svg>
);
