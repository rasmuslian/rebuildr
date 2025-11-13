import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SliderThumb } from "./slider-thumb";

export type DoubleSliderProps = {
  min: number;
  max: number;
  value1: number;
  value2: number;
  width?: number;
  onChange: (v1: number, v2: number) => void;
  onRelease?: (v1: number, v2: number) => void;
};
export const DoubleSlider = ({
  min,
  max,
  value1: inputValue,
  value2: inputValue2,
  width = 300,
  onChange,
  onRelease,
}: DoubleSliderProps) => {
  const [absoluteStart, setAbsoluteStart] = useState(0);
  const [absoluteStart2, setAbsoluteStart2] = useState(0);
  const colors = useThemeColor();

  const rightCalibration = 16;

  const value = Math.min(max, inputValue);
  const value2 = Math.min(max, inputValue2);
  const valuePosition = (value / max) * width;
  const valuePosition2 = (value2 / max) * width;
  const translateX = useSharedValue(
    Math.min(valuePosition, width - rightCalibration),
  );
  const translateX2 = useSharedValue(
    Math.min(valuePosition2, width - rightCalibration),
  );

  const gestureHandler = Gesture.Pan()
    .onBegin((event) => {
      setAbsoluteStart(event.absoluteX - valuePosition);
    })
    .onChange((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      translateX.value = Math.min(newPosition, width - rightCalibration);
      const newValue = min + (newPosition / width) * (max - min);

      onChange(newValue, value2);
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      const newValue = min + (newPosition / width) * (max - min);
      onRelease?.(newValue, value2);
    });
  const gestureHandler2 = Gesture.Pan()
    .onBegin((event) => {
      setAbsoluteStart2(event.absoluteX - valuePosition2);
    })
    .onChange((event) => {
      const deltaX = event.absoluteX - absoluteStart2;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      translateX2.value = Math.min(newPosition, width - rightCalibration);
      const newValue = min + (newPosition / width) * (max - min);

      onChange(value, newValue);
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart2;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      const newValue = min + (newPosition / width) * (max - min);
      onRelease?.(value, newValue);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedThumbStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX2.value }],
  }));
  const animatedProgressBarStyle = useAnimatedStyle(() => ({
    left:
      translateX.value <= translateX2.value
        ? translateX.value
        : translateX2.value,
    width: Math.abs(translateX2.value - translateX.value),
  }));

  useEffect(() => {
    translateX.value = Math.min(valuePosition, width - rightCalibration);
    translateX2.value = Math.min(valuePosition2, width - rightCalibration);
  }, [width]);

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

        <SliderThumb
          gestureHandler={gestureHandler}
          positionStyle={animatedThumbStyle}
        />
        <SliderThumb
          gestureHandler={gestureHandler2}
          positionStyle={animatedThumbStyle2}
        />
      </View>
    </View>
  );
};
