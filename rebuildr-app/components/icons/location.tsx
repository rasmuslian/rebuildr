import Svg, { Circle, Path } from "react-native-svg";
import { IconProps } from "./icon";

export const Location = (props: IconProps) => (
  <Svg
    width={props.size}
    height={props.size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Circle
      cx={12}
      cy={7.041}
      r={4.013}
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
    />
    <Path
      vectorEffect="non-scaling-stroke"
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M12 11.055v5.958M15.674 15.378c1.567.307 2.817.802 3.554 1.406.737.605.919 1.284.517 1.932-.402.647-1.366 1.226-2.738 1.644-1.373.419-3.077.654-4.843.667-1.765.014-3.493-.194-4.91-.59-1.418-.398-2.444-.96-2.917-1.601-.473-.641-.366-1.323.304-1.938.67-.615 1.865-1.129 3.397-1.46"
    />
  </Svg>
);
