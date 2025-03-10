import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Nails = (props: PictogramProps) =>
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
        d="M18.666 11.9a2.2 2.2 0 0 0 0-4.4h-8.8a2.2 2.2 0 0 0 0 4.4h8.8ZM16.466 31.7l-2.2 4.4-2.2-4.4V11.9h4.4v19.8ZM37.294 22.357a2.201 2.201 0 0 0 2.347-3.725l-7.454-4.685a2.2 2.2 0 1 0-2.347 3.726l7.454 4.684Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M24.89 37.947 20.685 40.5l.481-4.896 10.541-16.76 3.724 2.341-10.54 16.762Z"
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
        d="M9.72 5.95a1.1 1.1 0 0 0 0-2.2h-4.4a1.1 1.1 0 1 0 0 2.2h4.4ZM8.62 15.85l-1.1 2.2-1.1-2.2v-9.9h2.2v9.9ZM19.034 11.179a1.1 1.1 0 1 0 1.173-1.863L16.48 6.974a1.1 1.1 0 0 0-1.173 1.862l3.727 2.343Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="m12.832 18.973-2.103 1.277.24-2.448 5.271-8.38 1.862 1.17-5.27 8.381Z"
      />
    </Svg>
  );
