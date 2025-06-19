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

export type ContinuousSliderProps = {
  min: number;
  max: number;
  value: number;
  width?: number;
  onChange: (v: number) => void;
  onRelease?: (v: number) => void;
};
export const ContinuousSlider = ({
  min,
  max,
  value: inputValue,
  width: _width,
  onChange,
  onRelease,
}: ContinuousSliderProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = _width ?? screenWidth - 48;
  const [absoluteStart, setAbsoluteStart] = useState(0);
  const colors = useThemeColor();

  const rightCalibration = 16;

  const value = Math.min(max, inputValue);
  const valuePosition = (value / max) * width;
  const translateX = useSharedValue(
    Math.min(valuePosition, width - rightCalibration),
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

      onChange(newValue);
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      const newValue = min + (newPosition / width) * (max - min);
      onRelease?.(newValue);
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
      </View>
    </View>
  );
};
