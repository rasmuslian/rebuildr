import { primitives } from "@/src/constants/colors";
import { borderRadius } from "@/src/constants/sizes";
import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Icon } from "../icons/icon";
import { useThemeColor } from "@/src/hooks/useThemeColor";

const SLIDER_WIDTH = 300;

type ContinuousSliderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
};
export const ContinuousSlider = ({
  min,
  max,
  value: inputValue,
  onChange,
}: ContinuousSliderProps) => {
  const colors = useThemeColor();

  const value = Math.min(max, inputValue);
  const valuePosition = (value / max) * SLIDER_WIDTH;
  const translateX = useSharedValue(valuePosition);

  const gestureHandler = Gesture.Pan()
    .onChange((event) => {
      const deltaX = event.translationX + valuePosition;
      const newPosition = Math.min(Math.max(0, deltaX), SLIDER_WIDTH);

      translateX.value = newPosition;
    })
    .onEnd((event) => {
      const deltaX = event.translationX + valuePosition;
      const newPosition = Math.min(Math.max(0, deltaX), SLIDER_WIDTH);

      const newValue = (max - min) * (newPosition / SLIDER_WIDTH);
      onChange(newValue);
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
          width: SLIDER_WIDTH + 16,
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
