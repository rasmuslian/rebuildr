import { Badge } from "@components/badges/badge";
import { Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { ComponentProps } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  tabs: {
    title: string;
    badge?: ComponentProps<typeof Badge>;
    onActivate: () => void;
    active: boolean;
  }[];
};

export const TabRail = ({ tabs }: Props) => {
  const colors = useThemeColor();

  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
      }}
    >
      {tabs.map((tab, i) => {
        return (
          <Pressable
            onPress={tab.onActivate}
            key={i}
            style={(hovered) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: borderRadius.medium,
              },
              tab.active && {
                backgroundColor: colors.buttons.tonal.hovered,
              },
            ]}
          >
            <Label size="large">{tab.title}</Label>
            {tab.badge && <Badge {...tab.badge} />}
          </Pressable>
        );
      })}
    </View>
  );
};
