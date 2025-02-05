import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface RightChevronIconProps extends IconProps {}

export const RightChevronIcon = ({
  height = 19,
  width = 10,
  color,
  ...svgProps
}: RightChevronIconProps) => {
  return (
    <Svg
      {...svgProps}
      height={height}
      width={width}
      viewBox="0 0 10 19"
      fill="none"
      color={color}
    >
      <path
        d="M7.82 9.25L0.29 1.72C0.09 1.52 0 1.28 0 1.01C0 0.73 0.11 0.5 0.31 0.3C0.51 0.1 0.75 0 1.02 0C1.29 0 1.53 0.1 1.73 0.3L9.39 7.97C9.57 8.15 9.7 8.35 9.79 8.58C9.88 8.8 9.92 9.03 9.92 9.25C9.92 9.47 9.88 9.7 9.79 9.92C9.7 10.14 9.57 10.35 9.39 10.53L1.72 18.2C1.52 18.4 1.29 18.5 1.02 18.49C0.75 18.49 0.52 18.38 0.32 18.18C0.12 17.98 0.02 17.74 0.02 17.47C0.02 17.2 0.12 16.96 0.32 16.76L7.84 9.24L7.82 9.25Z"
        fill="#5F6368"
      />
    </Svg>
  );
};
