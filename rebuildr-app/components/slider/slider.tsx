import { useWindowDimensions } from "react-native";
import { ContinuousSlider, ContinuousSliderProps } from "./continuous-slider";
import { DoubleSlider, DoubleSliderProps } from "./double-slider";

type Props =
  | {
      type: "continuous";
      parentWidth?: number;
      sliderProps: ContinuousSliderProps;
    }
  | {
      type: "double";
      parentWidth?: number;
      sliderProps: DoubleSliderProps;
    };

export const Slider = ({ type, sliderProps, parentWidth }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = parentWidth ?? screenWidth - 48;
  const width = sliderProps.width
    ? Math.min(sliderProps.width, maxWidth)
    : maxWidth;

  if (type === "continuous") {
    return <ContinuousSlider {...sliderProps} width={width} />;
  }
  if (type === "double") {
    return <DoubleSlider {...sliderProps} width={width} />;
  }
};
