import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Slot, Tabs } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { MobileTabBar } from "@components/navigation/mobile-tab-bar";
import { isWeb, screenGrowStyle, WEB_FIXED } from "@constants/layout";

const DEFAULT_TAB_BAR_HEIGHT = 80;

export default function TabLayout() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const [tabBarHeight, setTabBarHeight] = useState(DEFAULT_TAB_BAR_HEIGHT);

  // Web: Slot + a viewport-fixed bottom bar; pad content so nothing hides behind it.
  if (isWeb) {
    return (
      <View style={screenGrowStyle}>
        <View
          style={{ flexGrow: 1, paddingBottom: isDesktop ? 0 : tabBarHeight }}
        >
          <Slot />
        </View>
        {!isDesktop && (
          <View
            onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}
            style={{
              position: WEB_FIXED,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
            }}
          >
            <MobileTabBar
              onHomeReselect={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // Native: the real bottom-tab navigator.
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
      tabBar={(props) =>
        isDesktop ? null : (
          <MobileTabBar
            onHomeReselect={() => {
              // Emit tabPress so index.tsx's useScrollToTop scrolls the feed up.
              const home = props.state.routes.find((r) => r.name === "index");
              if (home) {
                props.navigation.emit({
                  type: "tabPress",
                  target: home.key,
                  canPreventDefault: true,
                });
              }
            }}
          />
        )
      }
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="conversations" />
    </Tabs>
  );
}
