import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Paint = (props: PictogramProps) =>
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
        d="M7.533 18.51h15.4M17.8 7.51v4.766M12.667 7.51v4.766M21.833 7.51h-13.2a1.115 1.115 0 0 0-1.1 1.1v11a7.641 7.641 0 0 0 4.4 6.908v6.292a3.3 3.3 0 1 0 6.6 0v-6.292a7.64 7.64 0 0 0 4.4-6.908v-11a1.115 1.115 0 0 0-1.1-1.1ZM26.233 18.847a27.115 27.115 0 0 1 4.4-.337c5.471 0 9.9 1.466 9.9 3.3 0 1.833-4.4 3.3-9.9 3.3a27.103 27.103 0 0 1-4.4-.338"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21.834 38.676a17.922 17.922 0 0 0 8.8 1.79c5.47 0 9.9-1.467 9.9-3.3V21.81"
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
        d="M4.154 9.255h7.7M9.287 3.755v2.383M6.72 3.755v2.383M11.304 3.755h-6.6a.557.557 0 0 0-.55.55v5.5a3.821 3.821 0 0 0 2.2 3.454v3.146a1.65 1.65 0 1 0 3.3 0v-3.146a3.821 3.821 0 0 0 2.2-3.454v-5.5a.558.558 0 0 0-.55-.55ZM13.503 9.423a13.552 13.552 0 0 1 2.2-.168c2.736 0 4.95.733 4.95 1.65 0 .917-2.2 1.65-4.95 1.65a13.54 13.54 0 0 1-2.2-.169"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M11.304 19.338a8.961 8.961 0 0 0 4.4.895c2.735 0 4.95-.733 4.95-1.65v-7.678"
      />
    </Svg>
  );
