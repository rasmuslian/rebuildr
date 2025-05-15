import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { useState } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SliderThumb } from "./slider-thumb";

type SliderProps<T> = {
  values: T[];
  value: T;
  onChange: (v: T) => void;
  onRelease?: (v: T) => void;
  compareFunction: (v1: T, v2: T) => boolean;
  sliderWidth?: number;
};
export const Slider = <T,>({
  values,
  value,
  onChange,
  onRelease,
  compareFunction,
  sliderWidth = 300,
}: SliderProps<T>) => {
  const colors = useThemeColor();

  const stepCount = values.length;
  const stepWidth = sliderWidth / (stepCount - 1);
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
      const newValue = Math.min(Math.max(0, deltaX), sliderWidth);
      const newIndex = Math.floor(newValue / stepWidth);
      if (newIndex !== indexOfValue) {
        setStep(newIndex);
        onChange(values[newIndex]);
      }

      translateX.value = newIndex * stepWidth;
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newValue = Math.min(Math.max(0, deltaX), sliderWidth);
      const newIndex = Math.floor(newValue / stepWidth);
      onRelease?.(values[newIndex]);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedProgressBarStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View>
      {/* Container track */}
      <View
        style={{
          width: sliderWidth + 16,
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
