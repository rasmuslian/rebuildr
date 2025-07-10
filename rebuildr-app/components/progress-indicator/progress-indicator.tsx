import { useThemeColor } from "@/hooks/useThemeColor";
import { Radio } from "@components/controls/radio";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { ReactNode, useState } from "react";
import { View } from "react-native";

type Props = {
  steps: ReactNode[];
  current: number;
};

export const ProgressIndicator = ({ steps, current }: Props) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const colors = useThemeColor();

  const dotSize = 4;
  const dotSpacing = 4;
  const dotCount = Math.floor(containerHeight / (dotSize + dotSpacing));

  const renderCircle = (index: number) => {
    const active = current > index;

    if (active) {
      return (
        <View style={{ gap: 2 }}>
          <Radio selected customColor={primitives.primary700} icon="check" />
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            {/**Masks the dots view going through all circles */}
            <View
              style={{
                backgroundColor: colors.background.neutral,
                position: "absolute",
                height: "130%",
                width: 4,
                top: -2,
                borderRadius: borderRadius.medium,
              }}
            />
            {/**Progress bar */}
            <View
              style={{
                backgroundColor: colors.dividers.primary,
                position: "absolute",
                height: "130%",
                width: 4,
                borderRadius: borderRadius.medium,
              }}
            />
          </View>
        </View>
      );
    }
    if (index === current) {
      return <Radio selected customColor={primitives.primary700} />;
    }
    if (index === steps.length - 1) {
      return (
        <View>
          <Radio />
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.background.neutral,
                position: "absolute",
                height: "100%",
                width: 4,
                borderRadius: borderRadius.medium,
              }}
            />
          </View>
        </View>
      );
    }
    return <Radio />;
  };

  return (
    <View
      style={{ gap: 24 }}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setContainerHeight(height);
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 4,
          gap: dotSpacing,
          left: 10,
        }}
      >
        {Array.from({ length: dotCount }).map((dot, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 100,
              backgroundColor: colors.textField.disabled,
            }}
          />
        ))}
      </View>
      {steps.map((step, i) => {
        return (
          <View style={{ flexDirection: "row", gap: 21 }} key={i}>
            {renderCircle(i)}
            {step}
          </View>
        );
      })}
    </View>
  );
};
