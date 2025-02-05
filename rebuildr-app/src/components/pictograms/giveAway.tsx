import Svg, { Path } from "react-native-svg";
import { PictogramProps } from "./pictogram";

export const GiveAway = (props: PictogramProps) =>
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
        d="m28.047 20.888-4.305 8.766M36.007 11.639a4.063 4.063 0 1 0-8.122 0 4.063 4.063 0 1 0 0 8.123 4.062 4.062 0 0 0 8.122 0 4.062 4.062 0 0 0 0-8.123Z"
      />
      <Path
        stroke={props.color}
        strokeWidth={2.6}
        d="M31.945 16.431a.732.732 0 0 1 0-1.463M31.945 16.431a.732.732 0 0 0 0-1.463"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M26.14 24.77h-6.69a6.062 6.062 0 0 0-5.99 3.728 6.064 6.064 0 0 0-.463 2.448V35.5a4.619 4.619 0 0 0 4.61 4.634H24.7a5.31 5.31 0 0 0 5.051-3.712l1.036-3.254a2.691 2.691 0 0 0-2.552-3.512h-8.59"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.608 27.33H11.9a1.097 1.097 0 0 1 1.098 1.098v10.975A1.097 1.097 0 0 1 11.9 40.5H8.608"
      />
    </Svg>
  ) : (
    <Svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="m13.877 10.444-2.152 4.383M17.857 5.82a2.03 2.03 0 1 0-4.061 0 2.03 2.03 0 1 0 0 4.06 2.03 2.03 0 0 0 4.061 0 2.031 2.031 0 0 0 0-4.06Z"
      />
      <Path
        stroke={props.color}
        strokeWidth={1.9}
        d="M15.826 8.216a.366.366 0 0 1 0-.732M15.826 8.216a.366.366 0 0 0 0-.732"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M12.924 12.385H9.579a3.032 3.032 0 0 0-3.227 3.088v2.277a2.31 2.31 0 0 0 2.305 2.317h3.547a2.655 2.655 0 0 0 2.525-1.856l.519-1.627a1.346 1.346 0 0 0-1.276-1.756H9.675"
      />
      <Path
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
        d="M4.158 13.665h1.646a.548.548 0 0 1 .549.55V19.7a.549.549 0 0 1-.55.549H4.159"
      />
    </Svg>
  );
