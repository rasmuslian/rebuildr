import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface WindowIconProps extends IconProps {}

export const WindowIcon = ({
  height = 24,
  width = 24,
  color,
  ...svgProps
}: WindowIconProps) => {
  return (
    <Svg
      {...svgProps}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.31 0.05C2.97 0.14 2.73 0.29 2.46 0.58C2.26 0.79 2.11 1.05 2.04 1.33C2 1.48 2 2.04 1.99 11.99V22.49H1.28C0.58 22.49 0.58 22.49 0.44 22.56C0.16 22.69 0 22.94 0 23.25C0 23.54 0.15 23.78 0.41 23.92L0.53 23.98H22.97L23.09 23.92C23.35 23.78 23.5 23.54 23.5 23.25C23.5 22.94 23.34 22.69 23.06 22.56C22.93 22.5 22.92 22.5 22.22 22.49H21.52V11.98C21.52 2.03 21.52 1.47 21.47 1.32C21.33 0.79 20.9 0.31 20.4 0.11C20.31 0.08 20.18 0.04 20.1 0.02C19.99 0 17.53 0 11.71 0C3.73 0 3.47 0 3.31 0.05ZM3.59 1.58L3.52 1.65V11.23H10.98V1.51H3.66L3.59 1.58ZM12.52 6.37V11.23H19.98V1.65L19.91 1.58L19.84 1.51H12.52V6.37ZM3.52 17.63V22.49H10.98V12.77H3.52V17.63ZM12.52 17.63V22.49H19.98V12.77H12.52V17.63Z"
        fill="black"
      />
    </Svg>
  );
};
