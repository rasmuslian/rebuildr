import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const AddImage = (props: IconProps) => (
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
      strokeWidth={2}
      clipPath="url(#a)"
    >
      <Path d="M19.784 10.054v8.219c0 .985-.798 1.783-1.783 1.783H5.515a1.784 1.784 0 0 1-1.784-1.784V5.787c0-.985.798-1.783 1.784-1.783h8.203" />
      <Path d="m3.73 14.008 3.046-3.044a2 2 0 0 1 2.828 0l8.395 8.395m-4.89-6 .813-.814a1.8 1.8 0 0 1 2.545 0l3.317 3.317M21.86 4.003H17.71M19.784 1.927v4.151" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill={props.color} d="M0 .056h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
