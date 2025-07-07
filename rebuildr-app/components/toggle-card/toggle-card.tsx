import { Toggle } from "@components/controls/toggle";
import { Divider } from "@components/dividers/divider";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";

type ToggleCardProps = {
  title: string;
  valueString?: string;
  description?: string;
  enabled?: boolean;
  onPress: () => void;
  offColor?: "disabled" | "tonal";
  headerDivider?: boolean;
  error?: boolean;
} & PropsWithChildren;

export const ToggleCard = ({
  title,
  valueString,
  description,
  enabled,
  onPress,
  offColor = "tonal",
  headerDivider,
  error,
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
          borderColor: error
            ? colors.textField.error
            : colors.textField.clicked,
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title size="medium">{title}</Title>
            {valueString && (
              <Body size="medium" color="secondary">
                {valueString}
              </Body>
            )}
          </View>
          {description && (
            <Body size="medium" color="secondary">
              {description}
            </Body>
          )}
        </View>
        <Toggle value={enabled} onPress={onPress} />
      </View>
      {headerDivider && enabled && <Divider />}
      {enabled ? children : null}
    </View>
  );
};
