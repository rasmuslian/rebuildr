import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SliderThumb } from "./slider-thumb";

export type StepSliderProps<T> = {
  values: T[];
  value: T;
  onChange: (v: T) => void;
  onRelease?: (v: T) => void;
  compareFunction: (v1: T, v2: T) => boolean;
  width?: number;
};
export const StepSlider = <T,>({
  values,
  value,
  onChange,
  onRelease,
  compareFunction,
  width: _width,
}: StepSliderProps<T>) => {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = screenWidth - 48;
  const width = _width ? Math.min(_width, maxWidth) : maxWidth;
  const colors = useThemeColor();

  const rightCalibration = 16;
  const stepCount = values.length;
  const stepWidth = width / (stepCount - 1);
  const indexOfValue = values.findIndex((v) => compareFunction(v, value));
  const translateX = useSharedValue(indexOfValue * stepWidth);
  const [step, setStep] = useState(indexOfValue);
  const [absoluteStart, setAbsoluteStart] = useState(0);

  const gestureHandler = Gesture.Pan()
    .onBegin((event) => {
      setAbsoluteStart(event.absoluteX - indexOfValue * stepWidth);
    })
    .onChange((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newValue = Math.min(Math.max(0, deltaX), width);
      const newIndex = Math.floor(newValue / stepWidth);
      if (newIndex !== indexOfValue) {
        setStep(newIndex);
        onChange(values[newIndex]);
      }

      translateX.value = newIndex * stepWidth;
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newValue = Math.min(Math.max(0, deltaX), width);
      const newIndex = Math.floor(newValue / stepWidth);
      onRelease?.(values[newIndex]);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          translateX.value -
          //Calibrate thumb position on the last value of the slider so that its not outside the container
          (indexOfValue === values.length - 1 ? rightCalibration : 0),
      },
    ],
  }));
  const animatedProgressBarStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View>
      {/* Container track */}
      <View
        style={{
          width: width + rightCalibration,
          position: "relative",
          justifyContent: "center",
          paddingRight: 8,
          height: 16,
          backgroundColor: colors.buttons.tonal.enabled,
          borderRadius: borderRadius.small,
        }}
      >
        {/* Progress track */}
        <Animated.View
          style={[
            {
              position: "absolute",
              height: 16,
              backgroundColor: colors.buttons.filled.enabled,
              borderTopLeftRadius: borderRadius.small,
              borderBottomLeftRadius: borderRadius.small,
            },
            animatedProgressBarStyle,
          ]}
        />

        {/* Step indicators */}
        {Array.from({ length: stepCount }).map((_, i) => (
          <View
            key={i}
            style={[
              {
                position: "absolute",
                width: 4,
                height: 4,
                borderRadius: 3,
                backgroundColor:
                  step > i
                    ? colors.buttons.tonal.enabled
                    : colors.buttons.filled.enabled,
                top: 6,
              },
              { left: i * stepWidth + 5 },
            ]}
          />
        ))}
        <SliderThumb
          gestureHandler={gestureHandler}
          positionStyle={animatedThumbStyle}
        />
      </View>
    </View>
  );
};
