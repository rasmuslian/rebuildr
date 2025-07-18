import { useThemeColor } from "@/hooks/useThemeColor";
import { Radio } from "@components/controls/radio";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { ReactNode, useState } from "react";
import { View } from "react-native";

type Props = {
  steps: ReactNode[];
  current: number;
  isProblem?: boolean;
};

export const ProgressIndicator = ({ steps, current, isProblem }: Props) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const colors = useThemeColor();

  const dotSize = 4;
  const dotSpacing = 4;
  const dotCount = Math.floor(containerHeight / (dotSize + dotSpacing));

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
        {Array.from({ length: dotCount }).map((_, i) => (
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
            <Bubble
              index={i}
              currentIndex={current}
              active={current > i}
              nrOfSteps={steps.length}
              error={!!isProblem}
            />
            {step}
          </View>
        );
      })}
    </View>
  );
};

type BubbleProps = {
  index: number;
  currentIndex: number;
  active: boolean;
  nrOfSteps: number;
  error: boolean;
};
const Bubble = ({
  index,
  active,
  currentIndex,
  nrOfSteps,
  error,
}: BubbleProps) => {
  const colors = useThemeColor();
  const [layoutHeight, setLayoutHeight] = useState(0);
  const isLast = index === nrOfSteps - 1;
  const showError = isLast && error;

  //Masks the dots view going through all circles
  const renderMask = () => {
    return (
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
    );
  };

  if (active) {
    return (
      <View
        style={{ gap: 2 }}
        onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
      >
        <Radio
          selected
          customColor={
            showError ? primitives.semanticError500 : primitives.primary700
          }
          icon={showError ? "X" : "check"}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          {renderMask()}
          {!isLast && (
            <View
              style={{
                backgroundColor: colors.dividers.primary,
                position: "absolute",
                height: layoutHeight - 4,
                width: 4,
                borderRadius: borderRadius.medium,
              }}
            />
          )}
        </View>
      </View>
    );
  }
  if (index === currentIndex) {
    return (
      <View
        style={{ gap: 2 }}
        onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
      >
        <Radio selected customColor={primitives.primary700} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          {isLast && renderMask()}
        </View>
      </View>
    );
  }
  if (isLast) {
    return (
      <View style={{ gap: 2 }}>
        <Radio />
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          {renderMask()}
        </View>
      </View>
    );
  }
  return <Radio />;
};
