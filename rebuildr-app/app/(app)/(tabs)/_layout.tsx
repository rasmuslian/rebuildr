import { isLoggedInVar } from "@/apollo/config";
import { TabLayoutQuery } from "@/gql/graphql";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { Label } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useSellProductContext } from "@context/sell-product-context";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { router, Tabs, usePathname } from "expo-router";
import { useContext } from "react";
import { Pressable, View } from "react-native";
import { useSearchContext } from "@context/search-context";
import { useFilterProduct } from "@hooks/useFilterProduct";

export const TAB_LAYOUT = gql`
  query TabLayout {
    getUnreadConversationsCount
  }
`;

export default function TabLayout() {
  const colors = useThemeColor();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const pathName = usePathname();
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const { isDesktop } = useScreenType();
  const searchContext = useSearchContext();
  const { filterBuilder } = useFilterProduct();

  const { data } = useQuery<TabLayoutQuery>(TAB_LAYOUT);

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
      tabBar={(props) => {
        if (isDesktop) {
          return null;
        }
        const isHighlighted = (href: string) => {
          const hightlight = pathName.split("/")[1] === href;
          return hightlight;
        };

        const tabEntries: {
          name: string;
          icon: IconType;
          onPress: () => void;
          highlight: boolean;
          badgeNumber?: number;
        }[] = [
          {
            name: "Hem",
            icon: "home",
            onPress: () => {
              const homeRoute = props.state.routes.find(
                (r) => r.name === "index",
              );
              if (!homeRoute) return;
              const event = props.navigation.emit({
                type: "tabPress",
                target: homeRoute.key,
                canPreventDefault: true,
              });
              if (!isHighlighted("") && !event.defaultPrevented) {
                filterBuilder.reset().apply();
                searchContext.reset();
                router.navigate("/");
              }
            },
            highlight: isHighlighted(""),
          },
          {
            name: "Kategorier",
            icon: "categories",
            onPress: () => {
              router.navigate("/categories");
            },
            highlight: isHighlighted("categories"),
          },
          {
            name: "Ny annons",
            icon: "newListing",
            onPress: () => {
              if (!isLoggedIn) {
                setLoginVisible(true);
              } else {
                setSellProductVisible(true);
              }
            },
            highlight: false,
          },
          {
            name: "Hitta",
            icon: "search",
            onPress: () => {
              router.navigate("/search");
            },
            highlight: isHighlighted("search"),
          },
          {
            name: "Inkorg",
            icon: "message",
            onPress: () => {
              if (!isLoggedIn) {
                setLoginVisible(true);
              } else {
                router.navigate("/conversations");
              }
            },
            highlight: isHighlighted("conversations"),
            badgeNumber: data?.getUnreadConversationsCount,
          },
        ];
        return (
          <View
            style={{
              flexDirection: "row",
              gap: 12,

              backgroundColor: colors.background.primary,
              height: 80,
              paddingTop: 12,
              borderTopWidth: 0,
              paddingBottom: 16,
              paddingHorizontal: 8,
              justifyContent: "space-between",
            }}
          >
            {tabEntries.map((tabEntry, i) => {
              return (
                <Pressable
                  style={{ alignSelf: "center" }}
                  onPress={tabEntry.onPress}
                  key={i}
                >
                  <View
                    style={[
                      {
                        borderRadius: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 4,
                      },
                      tabEntry.highlight && {
                        backgroundColor: colors.navigation.enabled,
                      },
                    ]}
                  >
                    <Icon
                      icon={tabEntry.icon}
                      customColor={colors.logo.vector}
                    />
                    {!!tabEntry.badgeNumber && (
                      <View style={{ position: "absolute", right: 12, top: 0 }}>
                        <Badge text={tabEntry.badgeNumber.toString()} />
                      </View>
                    )}
                  </View>
                  <Label
                    size="small"
                    color="secondary"
                    style={{ marginTop: 4, textAlign: "center" }}
                  >
                    {tabEntry.name}
                  </Label>
                </Pressable>
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="conversations" />
    </Tabs>
  );
}
