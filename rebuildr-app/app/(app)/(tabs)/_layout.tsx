import { Label } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  const colors = useThemeColor();

  const tabOptions = (icon: IconType, label: string) => {
    return {
      tabBarIcon: ({
        focused,
      }: {
        focused: boolean;
        color: string;
        size: number;
      }) => (
        <View
          style={[
            {
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 4,
            },
            focused && { backgroundColor: colors.navigation.enabled },
          ]}
        >
          <Icon icon={icon} customColor={colors.logo.vector} />
        </View>
      ),
      tabBarLabel: () => (
        <Label size="small" color="secondary" style={{ marginTop: 4 }}>
          {label}
        </Label>
      ),
    };
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          height: 80,
          paddingTop: 12,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          ...tabOptions("home", "Hem"),
        }}
      />
      <Tabs.Screen
        name="categories/index"
        options={{
          ...tabOptions("categories", "Kategorier"),
        }}
      />
      <Tabs.Screen
        name="sell-product"
        options={{
          ...tabOptions("newListing", "Ny annons"),
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          ...tabOptions("search", "Hitta"),
        }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{
          ...tabOptions("message", "Inkorg"),
        }}
      />
    </Tabs>
  );
}
