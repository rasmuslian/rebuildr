import React, { useEffect, useMemo, useState } from "react";
import { View, LayoutChangeEvent, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useThemeColor } from "@hooks/useThemeColor";
import { themeColorTokens } from "@constants/colors";
import { Icon } from "@icons/icon";
import { borderRadius } from "@constants/sizes";

export type StepSliderProps<T> = {
  values: T[];
  value: T;
  onChange: (v: T) => void;
  onRelease?: (v: T) => void;
  compareFunction: (v1: T, v2: T) => boolean;
  width?: number;
};

const TRACK_HEIGHT = 16;
const THUMB_SIZE = 40;
const DOT_SIZE = 4;

const clampIndex = (i: number, max: number) => Math.max(0, Math.min(max, i));

function indexOfValue<T>(
  values: T[],
  value: T,
  compare: (a: T, b: T) => boolean,
) {
  const idx = values.findIndex((v) => compare(v, value));
  return idx < 0 ? 0 : idx;
}

export function StepSlider<T>({
  values,
  value,
  onChange,
  onRelease,
  compareFunction,
  width,
}: StepSliderProps<T>) {
  const colors = useThemeColor();

  const safeValues = values ?? [];
  const count = Math.max(safeValues.length, 2);

  const [measuredWidth, setMeasuredWidth] = useState<number>(width ?? 0);

  const currentIndex = useMemo(
    () => indexOfValue(safeValues, value, compareFunction),
    [safeValues, value, compareFunction],
  );

  const range = Math.max(0, measuredWidth - THUMB_SIZE);
  const stepPx = count <= 1 ? 0 : range / (count - 1);

  const x = useSharedValue(0);
  const startX = useSharedValue(0);
  const lastIndex = useSharedValue(currentIndex);

  const thumbCenterX = useDerivedValue(() => x.value + THUMB_SIZE / 2);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: thumbCenterX.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== measuredWidth) setMeasuredWidth(w);
  };

  const emitChange = (idx: number) => {
    const next = safeValues[idx];
    if (next !== undefined) onChange(next);
  };

  const emitRelease = (idx: number) => {
    const next = safeValues[idx];
    if (next !== undefined) onRelease?.(next);
  };

  const snapToIndex = (idx: number, release: boolean) => {
    const clampedIdx = clampIndex(idx, count - 1);
    const target = clamp(clampedIdx * stepPx, 0, range);

    x.value = withSpring(target, { damping: 18, stiffness: 220 });
    lastIndex.value = clampedIdx;

    runOnJS(emitChange)(clampedIdx);
    if (release) runOnJS(emitRelease)(clampedIdx);
  };

  useEffect(() => {
    if (!measuredWidth) return;
    const target = clamp(currentIndex * stepPx, 0, range);
    x.value = withTiming(target, { duration: 160 });
    lastIndex.value = currentIndex;
  }, [currentIndex, measuredWidth, stepPx, range, x, lastIndex]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
    })
    .onUpdate((event) => {
      const nextX = clamp(startX.value + event.translationX, 0, range);
      x.value = nextX;

      const idx = stepPx === 0 ? 0 : Math.round(nextX / stepPx);
      if (idx !== lastIndex.value) {
        lastIndex.value = idx;
        runOnJS(emitChange)(idx);
      }
    })
    .onEnd(() => {
      const idx = stepPx === 0 ? 0 : Math.round(x.value / stepPx);
      snapToIndex(idx, true);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    const nextX = clamp(event.x - THUMB_SIZE / 2, 0, range);
    const idx = stepPx === 0 ? 0 : Math.round(nextX / stepPx);
    snapToIndex(idx, true);
  });

  const gesture = Gesture.Simultaneous(pan, tap);

  const dotCenters = useMemo(() => {
    if (!measuredWidth) return [];
    return Array.from({ length: count }, (_, i) => i * stepPx + THUMB_SIZE / 2);
  }, [count, measuredWidth, stepPx]);

  return (
    <View onLayout={onLayout} style={{ height: THUMB_SIZE }}>
      {measuredWidth > 0 && (
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            {/* Track */}
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: TRACK_HEIGHT,
                borderRadius: borderRadius.small,
                backgroundColor: colors.buttons.tonal.enabled,
              }}
            />

            {/* Active fill */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: TRACK_HEIGHT,
                  borderRadius: borderRadius.small,
                  backgroundColor: colors.buttons.filled.enabled,
                },
                activeTrackStyle,
              ]}
            />

            {/* Step dots */}
            {dotCenters.map((cx, i) => (
              <StepDot
                key={i}
                cx={cx}
                cy={TRACK_HEIGHT / 2}
                size={DOT_SIZE}
                activeColor={colors.buttons.tonal.enabled}
                inactiveColor={colors.buttons.filled.enabled}
                thumbCenterX={thumbCenterX}
              />
            ))}

            {/* Thumb */}
            <Thumb animatedThumbStyle={thumbStyle} />
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

function StepDot({
  cx,
  cy,
  size,
  activeColor,
  inactiveColor,
  thumbCenterX,
}: {
  cx: number;
  cy: number;
  size: number;
  activeColor: string;
  inactiveColor: string;
  thumbCenterX: SharedValue<number>;
}) {
  const r = size / 2;

  const dotStyle = useAnimatedStyle(() => {
    const isActive = cx <= thumbCenterX.value + 0.5;
    return {
      backgroundColor: isActive ? activeColor : inactiveColor,
    };
  }, [cx, activeColor, inactiveColor]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: r,
          left: cx - r,
          top: cy - r,
        },
        dotStyle,
      ]}
    />
  );
}

function Thumb({ animatedThumbStyle }: { animatedThumbStyle: ViewStyle }) {
  const colors = themeColorTokens.dark;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
          backgroundColor: colors.buttons.filled.enabled,
          borderRadius: borderRadius.medium,
          justifyContent: "center",
          alignItems: "center",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },
        animatedThumbStyle,
      ]}
    >
      <Icon icon="drag" size={18} customColor={colors.text.primaryLight} />
    </Animated.View>
  );
}
