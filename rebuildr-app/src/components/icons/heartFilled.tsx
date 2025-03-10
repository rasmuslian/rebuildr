import Svg, { Path } from "react-native-svg";
import { IconProps } from "./icon";

type Props = {
  strokeColor: string;
} & IconProps;

export const HeartFilled = (props: Props) => {
  return (
    <Svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        vectorEffect="non-scaling-stroke"
        fill={props.color}
        stroke={props.strokeColor}
        strokeLinecap="round"
        strokeWidth={1.9}
        d="m11.366 18.708.634.567.634-.567a96.624 96.624 0 0 0 3.491-3.26c.92-.912 1.663-1.722 2.22-2.426.556-.703.981-1.376 1.233-2.013.244-.618.372-1.25.372-1.89 0-1.11-.38-2.086-1.153-2.86l-.662.663.662-.663c-.773-.773-1.75-1.153-2.86-1.153-.876 0-1.692.25-2.427.738a4.056 4.056 0 0 0-1.276 1.318h-.468a4.056 4.056 0 0 0-1.276-1.318l-.524.792.524-.792a4.327 4.327 0 0 0-2.428-.738c-1.11 0-2.086.38-2.859 1.153-.773.774-1.153 1.75-1.153 2.86 0 .64.129 1.272.372 1.89.252.637.677 1.31 1.233 2.013l.745-.59-.745.59c.557.704 1.3 1.514 2.22 2.426.92.912 2.084 2 3.491 3.26Z"
      />
    </Svg>
  );
};
