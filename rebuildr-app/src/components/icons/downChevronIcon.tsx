import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface DownChevronIconProps extends IconProps {}

export const DownChevronIcon = ({
  height = 7,
  width = 11,
  color,
  ...svgProps
}: DownChevronIconProps) => {
  return (
    <Svg
      {...svgProps}
      height={height}
      width={width}
      viewBox="0 0 11 7"
      fill="none"
      color={color}
    >
      <path
        d="M9.31432 0.310934L5.49508 4.43546L1.67584 0.310934C1.29195 -0.103645 0.671812 -0.103645 0.287919 0.310934C-0.0959731 0.725513 -0.0959731 1.39522 0.287919 1.8098L4.80604 6.68907C5.18993 7.10364 5.81007 7.10364 6.19396 6.68907L10.7121 1.8098C11.096 1.39522 11.096 0.725513 10.7121 0.310934C10.3282 -0.0930144 9.69821 -0.103645 9.31432 0.310934Z"
        fill="#717171"
      />
    </Svg>
  );
};
