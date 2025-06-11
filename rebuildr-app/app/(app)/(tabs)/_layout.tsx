import { isLoggedInVar } from "@/apollo/config";
import { Label } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { Href, router, Tabs, usePathname } from "expo-router";
import { useContext } from "react";
import { Pressable, View } from "react-native";

export default function TabLayout() {
  const colors = useThemeColor();
  const isLoggedIn = isLoggedInVar();
  const { setVisible } = useContext(LoginModalContext);
  const pathName = usePathname();

  const renderTabButton = (
    label: string,
    icon: IconType,
    href?: string,
    loginRequired: boolean = false,
  ) => {
    return (
      <Pressable
        style={{ alignSelf: "center" }}
        onPress={() => {
          if (!isLoggedIn && loginRequired) {
            setVisible(true);
          } else {
            router.navigate(href as Href);
          }
        }}
      >
        <View
          style={[
            {
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 4,
            },
            pathName === href && {
              backgroundColor: colors.navigation.enabled,
            },
          ]}
        >
          <Icon icon={icon} customColor={colors.logo.vector} />
        </View>
        <Label
          size="small"
          color="secondary"
          style={{ marginTop: 4, textAlign: "center" }}
        >
          {label}
        </Label>
      </Pressable>
    );
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
          tabBarButton: (props) => renderTabButton("Hem", "home", props.href),
        }}
      />
      <Tabs.Screen
        name="categories/index"
        options={{
          tabBarButton: (props) =>
            renderTabButton("Kategorier", "categories", props.href),
        }}
      />
      <Tabs.Screen
        name="sell-product"
        options={{
          tabBarButton: (props) =>
            renderTabButton("Ny annons", "newListing", props.href, true),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarButton: (props) =>
            renderTabButton("Hitta", "search", props.href),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarButton: (props) =>
            renderTabButton("Inkorg", "message", props.href, true),
        }}
      />
    </Tabs>
  );
}
