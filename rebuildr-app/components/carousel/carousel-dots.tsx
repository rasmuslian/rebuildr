import { Pressable, View } from "react-native";

import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";

type CarouselDotsProps = {
  count: number;
  activeIndex: number;
  onDotPress: (index: number) => void;
};

export const CarouselDots = ({
  count,
  activeIndex,
  onDotPress,
}: CarouselDotsProps) => {
  if (count <= 1) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={`Visa banner ${index + 1} av ${count}`}
          hitSlop={8}
          onPress={() => onDotPress(index)}
          style={{
            width: 8,
            height: 8,
            borderRadius: borderRadius.full,
            backgroundColor: primitives.neutrals100,
            opacity: index === activeIndex ? 1 : 0.4,
          }}
        />
      ))}
    </View>
  );
};
