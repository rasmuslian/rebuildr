import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { Icon } from "@icons/icon";

// Scrim rather than a solid fill, so the arrow reads on top of any banner or
// product image without hiding it.
const ARROW_BACKGROUND = "rgba(0, 0, 0, 0.4)";
const ARROW_BACKGROUND_ACTIVE = "rgba(0, 0, 0, 0.6)";

type ArrowButtonProps = {
  direction: "left" | "right";
  label: string;
  onPress: () => void;
};

const ArrowButton = ({ direction, label, onPress }: ArrowButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: borderRadius.full,
        backgroundColor:
          pressed || hovered || focused
            ? ARROW_BACKGROUND_ACTIVE
            : ARROW_BACKGROUND,
      })}
    >
      <Icon
        icon={direction === "left" ? "chevronLeft" : "chevronRight"}
        size={24}
        color="primaryLight"
      />
    </Pressable>
  );
};

type CarouselArrowsProps = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
  horizontalInset?: number;
};

export const CarouselArrows = ({
  canScrollLeft,
  canScrollRight,
  onPrev,
  onNext,
  prevLabel = "Föregående",
  nextLabel = "Nästa",
  horizontalInset = 16,
}: CarouselArrowsProps) => {
  const { isDesktop } = useScreenType();

  if (Platform.OS !== "web" || !isDesktop) return null;
  if (!canScrollLeft && !canScrollRight) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: horizontalInset,
        right: horizontalInset,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {canScrollLeft ? (
        <ArrowButton direction="left" label={prevLabel} onPress={onPrev} />
      ) : (
        <View />
      )}
      {canScrollRight ? (
        <ArrowButton direction="right" label={nextLabel} onPress={onNext} />
      ) : (
        <View />
      )}
    </View>
  );
};
