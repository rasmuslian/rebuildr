import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Window = (props: PictogramProps) =>
  props.type === "large" ? (
    <Svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 49 48"
      {...props}
    >
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.137 7.5h20.859c.346 0 .677.155.922.43.244.275.382.648.382 1.037V40.5H12.833V8.967c0-.39.137-.762.382-1.037.244-.275.576-.43.922-.43ZM10.226 40.5h28.681M12.833 24H36.3M24.566 7.5v33"
      />
    </Svg>
  ) : (
    <Svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 25 24"
      {...props}
    >
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M6.922 3.75h10.43c.173 0 .338.077.46.215.123.137.192.324.192.518V20.25H6.27V4.483c0-.194.069-.38.191-.518a.617.617 0 0 1 .461-.215ZM4.967 20.25h14.34M6.27 12h11.734M12.137 3.75v16.5"
      />
    </Svg>
  );
