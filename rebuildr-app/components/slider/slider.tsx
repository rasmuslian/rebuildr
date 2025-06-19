import { useWindowDimensions } from "react-native";
import { ContinuousSlider, ContinuousSliderProps } from "./continuous-slider";
import { DoubleSlider, DoubleSliderProps } from "./double-slider";
import { StepSlider, StepSliderProps } from "./step-slider";

type Props<T> =
  | {
      type: "continuous";
      sliderProps: ContinuousSliderProps;
    }
  | {
      type: "double";
      sliderProps: DoubleSliderProps;
    }
  | {
      type: "step";
      sliderProps: StepSliderProps<T>;
    };

export const Slider = <T,>({ type, sliderProps }: Props<T>) => {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = screenWidth - 48;
  const width = sliderProps.width
    ? Math.min(sliderProps.width, maxWidth)
    : maxWidth;
  if (type === "step") {
    return <StepSlider {...sliderProps} width={width} />;
  }
  if (type === "continuous") {
    return <ContinuousSlider {...sliderProps} width={width} />;
  }
  if (type === "double") {
    return <DoubleSlider {...sliderProps} width={width} />;
  }
};
