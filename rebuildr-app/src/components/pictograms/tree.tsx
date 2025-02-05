import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const Tree = (props: PictogramProps) =>
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
        d="M40.099 22.9a7.685 7.685 0 0 0-4.473-6.967 4.331 4.331 0 0 0-4.327-5.133c-.092 0-.179.022-.271.028a7.681 7.681 0 0 0-12.657 0c-.093-.006-.18-.028-.272-.028a4.332 4.332 0 0 0-4.326 5.133 7.683 7.683 0 0 0 1.622 14.498 5.986 5.986 0 0 0 9.304 2.049 5.988 5.988 0 0 0 9.305-2.054 7.698 7.698 0 0 0 6.095-7.526ZM24.7 18.5v22"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M24.7 28.4c4.4 0 6.6-2.2 6.6-6.6M24.7 24a5.196 5.196 0 0 1-5.5-5.5"
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
        d="M20.436 11.45A3.843 3.843 0 0 0 18.2 7.966 2.166 2.166 0 0 0 16.037 5.4c-.047 0-.09.01-.136.014a3.841 3.841 0 0 0-6.329 0c-.046-.003-.09-.014-.135-.014a2.166 2.166 0 0 0-2.164 2.566 3.842 3.842 0 0 0 .811 7.25 2.994 2.994 0 0 0 4.653 1.024 2.993 2.993 0 0 0 4.652-1.027 3.849 3.849 0 0 0 3.047-3.763ZM12.737 9.25v11"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M12.737 14.2c2.2 0 3.3-1.1 3.3-3.3M12.737 12a2.598 2.598 0 0 1-2.75-2.75"
      />
    </Svg>
  );
