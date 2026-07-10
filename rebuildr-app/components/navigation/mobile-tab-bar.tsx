import { isLoggedInVar } from "@/apollo/config";
import { TabLayoutQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { Label } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useSellProductContext } from "@context/sell-product-context";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { router, usePathname } from "expo-router";
import { useContext } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearchContext } from "@context/search-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { isWeb } from "@constants/layout";

export const TAB_LAYOUT = gql`
  query TabLayout {
    getUnreadConversationsCount
  }
`;

type TabEntry = {
  name: string;
  icon: IconType;
  onPress: () => void;
  highlight: boolean;
  badgeNumber?: number;
};

// Mobile bottom nav, shared by native (inside <Tabs> tabBar) and web (fixed in
// the tabs layout). `onHomeReselect` fires when Home is tapped while already on
// Home — the caller scrolls to top (web: window, native: emit tabPress).
export function MobileTabBar({
  onHomeReselect,
}: {
  onHomeReselect?: () => void;
}) {
  const colors = useThemeColor();
  const isLoggedIn = isLoggedInVar();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const pathName = usePathname();
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const searchContext = useSearchContext();
  const { filterBuilder } = useFilterProduct();
  const insets = useSafeAreaInsets();

  const { data } = useQuery<TabLayoutQuery>(TAB_LAYOUT);

  const isHighlighted = (href: string) => pathName.split("/")[1] === href;

  const goHome = () => {
    if (isHighlighted("")) {
      // Already on home: let the caller scroll to the top.
      onHomeReselect?.();
      return;
    }
    filterBuilder.reset().apply();
    searchContext.reset();
    router.navigate("/");
  };

  const tabEntries: TabEntry[] = [
    {
      name: "Hem",
      icon: "home",
      onPress: goHome,
      highlight: isHighlighted(""),
    },
    {
      name: "Kategorier",
      icon: "categories",
      onPress: () => router.navigate("/categories"),
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
      onPress: () => router.navigate("/search"),
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
        paddingTop: 12,
        borderTopWidth: 0,
        paddingBottom: 16 + (isWeb ? insets.bottom : 0),
        paddingHorizontal: 8,
        justifyContent: "space-between",
      }}
    >
      {tabEntries.map((tabEntry, i) => (
        <Pressable
          style={{ alignSelf: "center" }}
          onPress={tabEntry.onPress}
          key={i}
        >
          <View
            style={[
              { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 4 },
              tabEntry.highlight && {
                backgroundColor: colors.navigation.enabled,
              },
            ]}
          >
            <Icon icon={tabEntry.icon} customColor={colors.logo.vector} />
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
      ))}
    </View>
  );
}
