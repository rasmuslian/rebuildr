import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const PowerOutlet = (props: PictogramProps) =>
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
        d="M16.74 18.26c.55-.551 1.297-.86 2.075-.86h11.503c.778 0 1.524.309 2.074.86l4.704 4.703a1.467 1.467 0 0 1 0 2.074l-4.704 4.704c-.55.55-1.296.859-2.074.859H18.815a2.933 2.933 0 0 1-2.075-.86l-4.703-4.703a1.467 1.467 0 0 1 0-2.074l4.704-4.704Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M36.666 7.5h-24.2a4.4 4.4 0 0 0-4.4 4.4v24.2a4.4 4.4 0 0 0 4.4 4.4h24.2a4.4 4.4 0 0 0 4.4-4.4V11.9a4.4 4.4 0 0 0-4.4-4.4Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.516 24.733a.733.733 0 1 1 0-1.466M18.517 24.733a.733.733 0 1 0 0-1.466M24.566 27.208a.733.733 0 1 1 0-1.466M24.567 27.208a.733.733 0 1 0 0-1.466M30.616 24.733a.733.733 0 1 1 0-1.466M30.617 24.733a.733.733 0 1 0 0-1.466"
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
        d="M8.757 9.13c.275-.275.648-.43 1.037-.43h5.752c.39 0 .762.155 1.037.43l2.352 2.351a.733.733 0 0 1 0 1.038l-2.352 2.351c-.275.276-.648.43-1.037.43H9.794c-.389 0-.762-.155-1.037-.43L6.405 12.52a.733.733 0 0 1 0-1.037L8.757 9.13Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M18.72 3.75H6.62a2.2 2.2 0 0 0-2.2 2.2v12.1a2.2 2.2 0 0 0 2.2 2.2h12.1a2.2 2.2 0 0 0 2.2-2.2V5.95a2.2 2.2 0 0 0-2.2-2.2Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M9.645 12.366a.366.366 0 1 1 0-.733M9.645 12.366a.366.366 0 1 0 0-.733M12.67 13.604a.367.367 0 0 1 0-.733M12.67 13.604a.367.367 0 0 0 0-.733M15.695 12.366a.366.366 0 1 1 0-.733M15.695 12.366a.366.366 0 1 0 0-.733"
      />
    </Svg>
  );
