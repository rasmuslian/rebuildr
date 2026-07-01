import { Pressable, View } from "react-native";

import { Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { Icon } from "@icons/icon";

type BygghjalpenPageHeaderProps = {
  isDesktop: boolean;
  showHistory?: boolean;
  onHistoryPress: () => void;
  onNewChat: () => void;
};

export const BygghjalpenPageHeader = ({
  isDesktop,
  showHistory = true,
  onHistoryPress,
  onNewChat,
}: BygghjalpenPageHeaderProps) => {
  return (
    <View style={{ gap: 24 }}>
      <View
        style={{
          alignItems: isDesktop ? "center" : "flex-start",
          flexDirection: isDesktop ? "row" : "column",
          gap: isDesktop ? 28 : 16,
          justifyContent: isDesktop ? "space-between" : "flex-start",
        }}
      >
        <Title size="medium" style={{ color: primitives.primary800 }}>
          Återbyggaren
        </Title>
        <View style={{ flexDirection: "row", gap: isDesktop ? 22 : 18 }}>
          <HeaderAction
            icon="+"
            iconBackgroundColor={primitives.primary200}
            label="Ny chatt"
            onPress={onNewChat}
          />
          {showHistory && (
            <HeaderAction
              icon="message"
              label="Tidigare frågor"
              onPress={onHistoryPress}
            />
          )}
        </View>
      </View>
      <View
        style={{
          backgroundColor: primitives.primary300,
          height: isDesktop ? 2 : 1,
          width: "100%",
        }}
      />
    </View>
  );
};

const HeaderAction = ({
  icon,
  iconBackgroundColor = primitives.neutrals200,
  label,
  onPress,
}: {
  icon: "+" | "message";
  iconBackgroundColor?: string;
  label: string;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: iconBackgroundColor,
          borderRadius: 999,
          height: 28,
          justifyContent: "center",
          width: 28,
        }}
      >
        <Icon icon={icon} color="primaryDark" size={16} />
      </View>
      <Label size="medium" style={{ color: primitives.neutrals900 }}>
        {label}
      </Label>
    </Pressable>
  );
};
