import { Toggle } from "@components/controls/toggle";
import { Divider } from "@components/dividers/divider";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

type ToggleCardProps = {
  title: string;
  valueString?: string;
  description?: string | ReactNode;
  enabled?: boolean;
  onPress: () => void;
  offColor?: "disabled" | "tonal" | "none";
  headerDivider?: boolean;
  error?: boolean;
  disabled?: boolean;
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
  disabled,
  children,
}: ToggleCardProps) => {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          borderRadius: borderRadius.medium,
          padding: 16,
          gap: 24,
        },
        offColor === "tonal" && {
          backgroundColor: colors.buttons.tonal.enabled,
        },
        offColor === "disabled" && {
          backgroundColor: colors.buttons.filled.disabled,
        },
        offColor === "none" && {
          borderColor: colors.buttons.outlinedStroke.disabled,
          borderWidth: 1,
          padding: 15,
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
          {description &&
            (typeof description === "string" ? (
              <Body size="medium" color="secondary">
                {description}
              </Body>
            ) : (
              description
            ))}
        </View>
        <Toggle value={enabled} onPress={onPress} disabled={disabled} />
      </View>
      {headerDivider && enabled && <Divider />}
      {enabled ? children : null}
    </View>
  );
};
