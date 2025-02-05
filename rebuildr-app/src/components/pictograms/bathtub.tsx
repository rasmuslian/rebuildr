import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Bathtub = (props: PictogramProps) =>
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
        d="M27 27.3h13.934l-.968 5.867a8.8 8.8 0 0 1-8.683 7.333H17.584a8.8 8.8 0 0 1-8.682-7.333L7.934 27.3H16"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M25.9 35.367h-8.8a1.114 1.114 0 0 1-1.1-1.1V27.3a2.2 2.2 0 0 1 2.2-2.2h6.6a2.2 2.2 0 0 1 2.2 2.2v6.967a1.115 1.115 0 0 1-1.1 1.1ZM29.934 11.9a4.4 4.4 0 1 1 8.8 0v15.4"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M25.534 16.3a4.4 4.4 0 0 1 8.8 0h-8.8Z"
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
        d="M13.887 13.65h6.966l-.484 2.933a4.4 4.4 0 0 1-4.34 3.667h-6.85a4.4 4.4 0 0 1-4.341-3.667l-.484-2.933h4.033"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M13.337 17.683h-4.4a.557.557 0 0 1-.55-.55V13.65a1.1 1.1 0 0 1 1.1-1.1h3.3a1.1 1.1 0 0 1 1.1 1.1v3.483a.557.557 0 0 1-.55.55ZM15.354 5.95a2.2 2.2 0 0 1 4.4 0v7.7"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M13.154 8.15a2.2 2.2 0 1 1 4.4 0h-4.4Z"
      />
    </Svg>
  );
