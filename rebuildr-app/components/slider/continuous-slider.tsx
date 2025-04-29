import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import React, { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type ContinuousSliderProps = {
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
  width = 300,
  onChange,
  onRelease,
}: ContinuousSliderProps) => {
  const [absoluteStart, setAbsoluteStart] = useState(0);
  const colors = useThemeColor();

  const value = Math.min(max, inputValue);
  const valuePosition = (value / max) * width;
  const translateX = useSharedValue(valuePosition);

  const gestureHandler = Gesture.Pan()
    .onBegin((event) => {
      setAbsoluteStart(event.absoluteX - valuePosition);
    })
    .onChange((event) => {
      const deltaX = event.absoluteX - absoluteStart; //event.translationX + valuePosition;
      const newPosition = Math.min(Math.max(0, deltaX), width);

      translateX.value = newPosition;
      const newValue = min + (newPosition / width) * (max - min);

      onChange(newValue);
    })
    .onEnd((event) => {
      const deltaX = event.absoluteX - absoluteStart; //event.translationX + valuePosition;
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
          width: width + 16,
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

        {/* Draggable Thumb */}
        <GestureDetector gesture={gestureHandler}>
          <Animated.View
            style={[
              {
                width: 40,
                height: 40,
                backgroundColor: primitives.neutrals100,
                borderRadius: borderRadius.medium,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: -12,

                bottom: 0,
              },
              animatedThumbStyle,
            ]}
          >
            <Icon icon="drag" size={18} />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};
