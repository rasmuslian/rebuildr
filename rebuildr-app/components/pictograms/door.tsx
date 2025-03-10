import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Door = (props: PictogramProps) =>
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
        d="M16.587 9.497h16.76a1.29 1.29 0 0 1 1.289 1.289v27.717H15.298V10.786a1.289 1.289 0 0 1 1.29-1.29ZM11.43 38.503h27.073"
      />
      <Path
        stroke={props.color}
        strokeWidth={2}
        d="M29.801 24.483a.483.483 0 0 1 0-.966M29.801 24.483a.483.483 0 0 0 0-.966"
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
        d="M8.147 4.748h8.38a.645.645 0 0 1 .644.645v13.859H7.502V5.393a.645.645 0 0 1 .645-.645ZM5.569 19.252h13.536"
      />
      <Path
        stroke={props.color}
        strokeWidth={1.9}
        d="M14.754 12.242a.242.242 0 1 1 0-.484M14.754 12.242a.242.242 0 0 0 0-.484"
      />
    </Svg>
  );
