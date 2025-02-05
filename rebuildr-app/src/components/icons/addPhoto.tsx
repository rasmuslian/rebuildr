import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const AddPhoto = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 24 25"
    fill="none"
    {...props}
  >
    <G
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      clipPath="url(#a)"
    >
      <Path
        strokeWidth={1.9}
        d="M14.82 4.718H9.222A2 2 0 0 0 7.299 6.17l-.446 1.565H4.448A1.655 1.655 0 0 0 2.793 9.39v8.568a1.655 1.655 0 0 0 1.655 1.655h14.895a1.655 1.655 0 0 0 1.655-1.655V10.565"
      />
      <Path
        strokeWidth={1.9}
        d="M11.896 15.674a2.995 2.995 0 1 0 0-5.99 2.995 2.995 0 0 0 0 5.99Z"
      />
      <Path strokeWidth={2} d="M23.074 4.718h-4.152M20.998 2.642v4.152" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill={props.color} d="M0 .056h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
