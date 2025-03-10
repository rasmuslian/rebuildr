import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const WheelBarrow = (props: PictogramProps) =>
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
        d="M12.734 32.8a4.4 4.4 0 1 0 8.799 0 4.4 4.4 0 0 0-8.8 0Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m13.86 29.866-5.227-6.958a2.2 2.2 0 0 1 1.9-3.308h23.1a2.2 2.2 0 0 1 1.83 3.42l-8.881 9.115a2.199 2.199 0 0 1-1.577.664h-3.471"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M34.733 23.77v9.03a2.2 2.2 0 0 1-3.756 1.556l-3.813-2.827M35.638 20.895l5.695-5.695M31.922 19.6a3.69 3.69 0 0 0 .13-.976 3.86 3.86 0 0 0-4.56-3.847 6.818 6.818 0 0 0-12.397 0 3.857 3.857 0 0 0-4.561 3.847c0 .329.038.656.113.976"
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
        d="M6.754 16.4a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 0 0-4.4 0Z"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="m7.317 14.933-2.614-3.479a1.1 1.1 0 0 1 .95-1.654h11.55a1.1 1.1 0 0 1 .916 1.71l-4.441 4.557a1.102 1.102 0 0 1-.789.333h-1.735"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M17.754 11.885V16.4a1.1 1.1 0 0 1-1.878.778l-1.907-1.413M18.206 10.447 21.054 7.6M16.348 9.8c.043-.16.065-.323.065-.488a1.927 1.927 0 0 0-2.28-1.923 3.409 3.409 0 0 0-6.199 0 1.929 1.929 0 0 0-2.28 1.923c0 .164.019.328.056.488"
      />
    </Svg>
  );
