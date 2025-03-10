import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Bricks = (props: PictogramProps) =>
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
        d="M7.934 39.4h33M7.934 32.8h33M10.133 32.8h4.4v6.6h-4.4v-6.6ZM22.233 32.8h4.4v6.6h-4.4v-6.6ZM34.334 32.8h4.4v6.6h-4.4v-6.6ZM10.134 8.6h28.6s2.2 0 2.2 2.2v15.4s0 2.2-2.2 2.2h-28.6s-2.2 0-2.2-2.2V10.8s0-2.2 2.2-2.2ZM7.934 21.8h33M7.934 15.2h33M16.733 8.6v6.6M25.534 8.6v6.6M34.334 8.6v6.6M16.733 21.8v6.6M25.534 21.8v6.6M34.334 21.8v6.6M14.534 15.2v6.6M23.334 15.2v6.6M32.133 15.2v6.6"
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
        d="M3.82 19.7h16.5M3.82 16.4h16.5M4.92 16.4h2.2v3.3h-2.2v-3.3ZM10.97 16.4h2.2v3.3h-2.2v-3.3ZM17.02 16.4h2.2v3.3h-2.2v-3.3ZM4.92 4.3h14.3s1.1 0 1.1 1.1v7.7s0 1.1-1.1 1.1H4.92s-1.1 0-1.1-1.1V5.4s0-1.1 1.1-1.1ZM3.82 10.9h16.5M3.82 7.6h16.5M8.22 4.3v3.3M12.62 4.3v3.3M17.02 4.3v3.3M8.22 10.9v3.3M12.62 10.9v3.3M17.02 10.9v3.3M7.12 7.6v3.3M11.52 7.6v3.3M15.92 7.6v3.3"
      />
    </Svg>
  );
