import { Toggle } from "@components/controls/toggle";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren } from "react";
import { View } from "react-native";

type ToggleCardProps = {
  title: string;
  description: string;
  enabled?: boolean;
  onPress: () => void;
  offColor?: "disabled" | "tonal";
} & PropsWithChildren;

export const ToggleCard = ({
  title,
  description,
  enabled,
  onPress,
  offColor = "tonal",
  children,
}: ToggleCardProps) => {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          borderRadius: borderRadius.medium,
          backgroundColor:
            offColor === "tonal"
              ? colors.buttons.tonal.enabled
              : colors.buttons.filled.disabled,
          padding: 16,
          gap: 24,
        },
        enabled && {
          borderColor: colors.textField.clicked,
          borderWidth: 1,
          padding: 15,
          backgroundColor: colors.background.neutral,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View style={{ gap: 4, flex: 1 }}>
          <Title size="medium">{title}</Title>
          <Body size="medium" color="secondary">
            {description}
          </Body>
        </View>
        <Toggle value={enabled} onPress={onPress} />
      </View>

      {enabled ? children : null}
    </View>
  );
};
