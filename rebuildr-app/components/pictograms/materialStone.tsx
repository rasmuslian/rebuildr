import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const MaterialStone = (props: PictogramProps) =>
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
        d="M41.143 40.5 38.141 9.48a2.2 2.2 0 0 0-2.188-1.98H13.448a2.2 2.2 0 0 0-2.188 1.98L8.258 40.5h32.885ZM9.322 29.5h30.756M10.369 18.5h28.644M24.753 18.5v11M31.72 29.5l.733 11M30.253 7.5l.733 11M17.786 29.5l-.734 11M19.253 7.5l-.733 11"
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
        d="M20.425 20.25 18.924 4.74a1.1 1.1 0 0 0-1.094-.99H6.577a1.1 1.1 0 0 0-1.094.99l-1.5 15.51h16.442ZM4.515 14.75h15.378M5.038 9.25H19.36M12.23 9.25v5.5M15.713 14.75l.367 5.5M14.98 3.75l.367 5.5M8.747 14.75l-.367 5.5M9.48 3.75l-.367 5.5"
      />
    </Svg>
  );
