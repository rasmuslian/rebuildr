import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Star = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 11 11"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="m5.5 1.695 1.229 2.49 2.748.4-1.989 1.937.47 2.736L5.5 7.966 3.043 9.258l.469-2.736-1.988-1.936 2.747-.402L5.5 1.694Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M.5.477h10v10H.5z" />
      </ClipPath>
    </Defs>
  </Svg>
);
