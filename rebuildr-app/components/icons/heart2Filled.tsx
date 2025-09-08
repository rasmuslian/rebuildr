import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

type Props = {
  strokeColor: string;
} & IconProps;

export const Heart2Filled = ({ size, strokeColor, ...rest }: Props) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" {...rest}>
    <Path
      stroke={strokeColor}
      fill={rest.color}
      strokeLinecap="round"
      strokeWidth={1.9}
      d="M16.99 3.48c1.345 0 2.517.458 3.446 1.387.93.93 1.388 2.1 1.388 3.445a6.25 6.25 0 0 1-.455 2.303c-.306.776-.83 1.607-1.526 2.488-.697.881-1.632 1.9-2.793 3.051-1.161 1.153-2.635 2.527-4.417 4.123l-.633.569-.634-.569c-1.782-1.595-3.255-2.97-4.416-4.123-1.161-1.151-2.096-2.17-2.794-3.051-.697-.88-1.219-1.712-1.525-2.488a6.25 6.25 0 0 1-.455-2.303c0-1.344.459-2.515 1.388-3.445.93-.929 2.1-1.387 3.444-1.387 1.06 0 2.046.302 2.938.892.69.458 1.235 1.03 1.61 1.714h.889c.375-.684.919-1.256 1.61-1.714a5.232 5.232 0 0 1 2.936-.892Z"
    />
  </Svg>
);
