import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const AddImage = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.784 9.998v8.218c0 .985-.798 1.784-1.783 1.784H5.515a1.784 1.784 0 0 1-1.784-1.784V5.73c0-.985.798-1.784 1.784-1.784h8.203"
    />
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m3.73 13.952 3.046-3.044a2 2 0 0 1 2.828 0l8.395 8.395m-4.89-6.001.813-.814a1.8 1.8 0 0 1 2.545 0l3.317 3.317M21.86 3.946H17.71M19.784 1.87v4.152"
    />
  </Svg>
);
