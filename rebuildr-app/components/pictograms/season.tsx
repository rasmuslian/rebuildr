import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Season = (props: PictogramProps) =>
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
        d="M27.95 36.837s1.787 3.659 4.794 3.385c6.098-.558 5.69-8.663 7.92-11.525a13.346 13.346 0 0 0-12.12.11c-3.16 1.783-3.384 4.795-.595 8.03Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M32.262 33.12s-3.96.49-6.78 7.377M21.967 33.654A9.9 9.9 0 1 1 34.005 22.9M24.167 9.702v-2.2M34.277 13.89l1.556-1.556M14.058 34.111l-1.556 1.555M9.87 24h-2.2M14.058 13.89l-1.556-1.556"
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
        d="M14.828 18.419s.894 1.829 2.398 1.692c3.049-.279 2.845-4.331 3.96-5.763a6.672 6.672 0 0 0-6.06.055c-1.58.892-1.692 2.398-.298 4.016Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M16.985 16.56s-1.98.245-3.39 3.689M11.837 16.827a4.95 4.95 0 1 1 6.02-5.377M12.937 4.851v-1.1M17.992 6.945l.778-.778M7.882 17.055l-.778.778M5.788 12h-1.1M7.882 6.945l-.778-.778"
      />
    </Svg>
  );
