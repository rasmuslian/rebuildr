import { useWindowDimensions } from "react-native";
import { ContinuousSlider, ContinuousSliderProps } from "./continuous-slider";
import { DoubleSlider, DoubleSliderProps } from "./double-slider";
import { StepSlider, StepSliderProps } from "./step-slider";

type Props<T> =
  | {
      type: "continuous";
      parentWidth?: number;
      sliderProps: ContinuousSliderProps;
    }
  | {
      type: "double";
      parentWidth?: number;
      sliderProps: DoubleSliderProps;
    }
  | {
      type: "step";
      parentWidth?: number;
      sliderProps: StepSliderProps<T>;
    };

export const Slider = <T,>({ type, sliderProps, parentWidth }: Props<T>) => {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = parentWidth ?? screenWidth - 48;
  const width = sliderProps.width
    ? Math.min(sliderProps.width, maxWidth)
    : maxWidth;

  if (type === "step") {
    return <StepSlider {...sliderProps} />;
  }
  if (type === "continuous") {
    return <ContinuousSlider {...sliderProps} width={width} />;
  }
  if (type === "double") {
    return <DoubleSlider {...sliderProps} width={width} />;
  }
};
