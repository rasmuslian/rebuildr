import { Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { Pressable, View } from "react-native";

type Props = {
  onClose: () => void;
  title: string;
  prog1?: number;
  prog2?: number;
  prog3?: number;
};

export const ProgressHeader = ({
  onClose,
  title,
  prog1 = 0,
  prog2 = 0,
  prog3 = 0,
}: Props) => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
          marginBottom: 12,
        }}
      >
        <Title size="medium">{title}</Title>
        <Pressable onPress={onClose}>
          <Icon icon="X" size={18} />
        </Pressable>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ProgressDiv progress={prog1} />
        <ProgressDiv progress={prog2} />
        <ProgressDiv progress={prog3} />
      </View>
    </View>
  );
};

type ProgressDivProps = {
  progress: number; //0 to 100
};

const ProgressDiv = ({ progress }: ProgressDivProps) => {
  const colors = useThemeColor();
  const height = 4;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={{
        backgroundColor: colors.buttons.tonal.enabled,
        height,
        flex: 1,
        borderRadius: borderRadius.small,
      }}
    >
      <View
        style={{
          position: "absolute",
          height,
          width: `${clampedProgress}%`,
          backgroundColor: colors.buttons.filled.enabled,
          borderRadius: borderRadius.small,
        }}
      />
    </View>
  );
};
