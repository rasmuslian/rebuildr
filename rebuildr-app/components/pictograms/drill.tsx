import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Drill = (props: PictogramProps) =>
  props.type === "large" ? (
    <Svg
      viewBox="0 0 49 48"
      width={props.size}
      height={props.size}
      fill="none"
      {...props}
    >
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M23.133 9.7h15.4a2.933 2.933 0 0 1 2.934 2.933v7.333a2.933 2.933 0 0 1-2.934 2.934h-15.4a1.466 1.466 0 0 1-1.466-1.467V11.166A1.466 1.466 0 0 1 23.133 9.7Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M32.266 35.495a3.266 3.266 0 1 0 6.468-.924L37.067 22.9h-6.6l1.8 12.595ZM16.533 11.9h5.134v8.8h-5.134a1.467 1.467 0 0 1-1.466-1.467v-5.867a1.467 1.467 0 0 1 1.466-1.466ZM15.067 16.3h-6.6"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m26.067 22.9.393 1.962a4.4 4.4 0 0 0 4.313 3.538h.48M30.467 14.1h4.4M30.467 18.5h4.4"
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
        d="M11.954 4.85h7.7a1.467 1.467 0 0 1 1.466 1.467v3.666a1.467 1.467 0 0 1-1.466 1.467h-7.7a.733.733 0 0 1-.734-.733V5.582a.733.733 0 0 1 .733-.733Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M16.52 17.748a1.634 1.634 0 0 0 3.234-.462l-.834-5.836h-3.3l.9 6.298ZM8.653 5.95h2.567v4.4H8.653a.733.733 0 0 1-.733-.733V6.683a.733.733 0 0 1 .733-.733ZM7.92 8.15h-3.3"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="m13.42 11.45.197.981a2.2 2.2 0 0 0 2.156 1.769h.24M15.62 7.05h2.2M15.62 9.25h2.2"
      />
    </Svg>
  );
