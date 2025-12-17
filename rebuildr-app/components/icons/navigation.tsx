import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Navigation = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 19 19"
    fill="none"
    {...props}
  >
    <Path
      d="M8.2049 11.0276L9.95508 17.3796C10.123 17.9751 10.9438 18.0163 11.1863 17.429L17.769 1.85757C17.9987 1.30773 17.4692 0.778253 16.9194 1.00795L1.36028 7.60296C0.785285 7.8578 0.826479 8.67854 1.40962 8.83419L7.76162 10.5844C7.97251 10.6444 8.14489 10.8168 8.2049 11.0276Z"
      stroke={props.color}
      strokeWidth={1.9}
    />
  </Svg>
);
