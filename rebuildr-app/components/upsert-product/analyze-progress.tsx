import { Body, Label } from "@components/typography/text";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

const STEPS = [
  "Tittar på bilderna…",
  "Föreslår kategori…",
  "Skriver rubrik och beskrivning…",
  "Uppskattar mängd, mått och pris…",
];
const STEP_INTERVAL_MS = 3000;
//ease toward 90% over the typical analysis duration — completion is the
//parent unmounting this banner, so the bar never needs to reach 100%
const PROGRESS_TARGET = 0.9;
const PROGRESS_DURATION_MS = 12000;

export const AnalyzeProgress = () => {
  const colors = useThemeColor();
  const [stepIndex, setStepIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: PROGRESS_TARGET,
      duration: PROGRESS_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      //string %-width interpolation is not supported by the native driver
      useNativeDriver: false,
    }).start();
    const interval = setInterval(
      () => setStepIndex((i) => (i + 1) % STEPS.length),
      STEP_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
        padding: 16,
      }}
    >
      <LoadingSpinner />
      <View style={{ flex: 1, gap: 6 }}>
        <Label size="medium">{STEPS[stepIndex]}</Label>
        <View
          style={{
            height: 4,
            borderRadius: borderRadius.small,
            backgroundColor: colors.background.neutral,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              borderRadius: borderRadius.small,
              backgroundColor: colors.buttons.filled.enabled,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
        <Body size="small" color="secondary">
          Kategori, rubrik, beskrivning och mer fylls i automatiskt utifrån
          bilderna du laddat upp.
        </Body>
      </View>
    </View>
  );
};
