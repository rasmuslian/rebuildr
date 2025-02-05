import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface PersonIconProps extends IconProps {}

export const PersonIcon = ({
  height = 12,
  width = 12,
  color,
  ...svgProps
}: PersonIconProps) => {
  return (
    <Svg
      {...svgProps}
      height={height}
      width={width}
      viewBox="0 0 12 12"
      fill="none"
      color={color}
    >
      <g clipPath="url(#clip0_182_695)">
        <path
          d="M6 6C7.6575 6 9 4.6575 9 3C9 1.3425 7.6575 0 6 0C4.3425 0 3 1.3425 3 3C3 4.6575 4.3425 6 6 6ZM6 1.5C6.825 1.5 7.5 2.175 7.5 3C7.5 3.825 6.825 4.5 6 4.5C5.175 4.5 4.5 3.825 4.5 3C4.5 2.175 5.175 1.5 6 1.5ZM6 6.75C3.9975 6.75 0 7.755 0 9.75V11.25C0 11.6625 0.3375 12 0.75 12H11.25C11.6625 12 12 11.6625 12 11.25V9.75C12 7.755 8.0025 6.75 6 6.75ZM10.5 10.5H1.5V9.7575C1.65 9.2175 3.975 8.25 6 8.25C8.025 8.25 10.35 9.2175 10.5 9.75V10.5Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_182_695">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </Svg>
  );
};
