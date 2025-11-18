import { Logo } from "@components/logo/logo";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable, View, Animated } from "react-native";
import { router, usePathname } from "expo-router";
import { showHamburgerMenuVar } from "@/apollo/config";
import { Icon, IconType } from "@icons/icon";
import { Button } from "@components/buttons/button";
import { useContext, useEffect, useRef, useState } from "react";
import { LoginModalContext } from "@context/loginModalContext";
import { useSellProductContext } from "@context/sell-product-context";
import { useQuery } from "@apollo/client";
import { GetMeQuery, TabLayoutQuery } from "@/gql/graphql";
import { TAB_LAYOUT } from "@/app/(app)/(tabs)/_layout";
import { Badge } from "@components/badges/badge";
import { Divider } from "@components/dividers/divider";
import { horizontalPadding } from "@constants/sizes";
import { Avatar } from "@components/avatar/avatar";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import AccountContent from "@components/account/account-content";
import { SearchBar } from "@components/search/search-bar";
import { AccountWrapperDesktop } from "@components/account/account-wrapper.desktop";

type Props = {
  isLoggedIn: boolean;
  theme: "light" | "dark";
  showSearchBar?: boolean;
  animateSearchBar?: boolean;
  me?: GetMeQuery["me"];
};

export default function TopBarDesktop({
  isLoggedIn,
  theme,
  showSearchBar = true,
  animateSearchBar = false,
  me,
}: Props) {
  const colors = useThemeColor();
  const pathname = usePathname();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const [openAccount, setOpenAccount] = useState(false);

  const searchOpacity = useRef(new Animated.Value(0)).current;
  const { data: tabData } = useQuery<TabLayoutQuery>(TAB_LAYOUT);

  const icons: {
    icon?: IconType;
    onPress: () => void;
    badgeNumber?: number;
    active: boolean;
    avatarUrl?: string;
  }[] = [
    {
      avatarUrl: me?.profilePicture?.url,
      onPress: () => {
        setOpenAccount(true);
      },
      active: pathname.startsWith("/account"),
    },
    {
      icon: "heart",
      onPress: () => {
        router.navigate("/account/favorites");
      },
      active: pathname.startsWith("/account/favorites"),
    },
    {
      icon: "message",
      onPress: () => {
        router.navigate("/conversations");
      },
      badgeNumber: tabData?.getUnreadConversationsCount,
      active: pathname.startsWith("/conversations"),
    },
  ];

  useEffect(() => {
    Animated.timing(searchOpacity, {
      toValue: showSearchBar ? 1 : 0,
      duration: animateSearchBar ? 200 : 0,
      useNativeDriver: true,
    }).start();
  }, [showSearchBar]);

  return (
    <View>
      <View
        style={{
          width: "100%",
          paddingHorizontal: horizontalPadding.desktop,
          backgroundColor:
            theme === "light" ? colors.background.neutral : colors.logo.vector,
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          height: 72,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 32 }}>
          <Pressable onPress={() => router.navigate("/")}>
            <Logo
              width={118}
              height={24}
              customColor={theme === "light" ? colors.logo.vector : undefined}
            />
          </Pressable>
          <Animated.View
            style={{
              opacity: searchOpacity,
            }}
          >
            <SearchBar
              visible={showSearchBar}
              searchOnSubmit
              placeholder="Vad letar du efter?"
              style={{
                borderBottomWidth: 0,
                width: 320,
              }}
              backgroundColor={colors.background.neutral}
              borderStyle={
                theme === "light"
                  ? { borderColor: colors.dividers.neutral, borderWidth: 1 }
                  : undefined
              }
            />
          </Animated.View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {isLoggedIn &&
              icons.map(
                ({ icon, onPress, badgeNumber, avatarUrl, active }, index) => (
                  <Pressable key={index} onPress={onPress}>
                    <View
                      style={{
                        position: "relative",
                        height: 40,
                        width: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor:
                          theme === "light" && active
                            ? colors.buttons.tonal.enabled
                            : undefined,
                        borderRadius: 12,
                      }}
                    >
                      {icon ? (
                        <Icon
                          icon={icon}
                          size={18}
                          color={
                            theme === "dark" ? "primaryLight" : "primaryDark"
                          }
                        />
                      ) : (
                        <Avatar imageUrl={avatarUrl} size={18} />
                      )}
                      {!!badgeNumber && (
                        <View
                          style={{ position: "absolute", right: 2, top: 2 }}
                        >
                          <Badge text={badgeNumber.toString()} theme={theme} />
                        </View>
                      )}
                    </View>
                  </Pressable>
                ),
              )}
          </View>
          <Button
            type={theme === "dark" ? "outlinedStroke" : "tonal"}
            theme={theme}
            onPress={() => showHamburgerMenuVar(true)}
            icon="categories"
            label="Kategorier"
          />
          {isLoggedIn ? (
            <Button
              type="filled"
              onPress={() => setSellProductVisible(true)}
              label="Ny annons"
              theme={theme}
            />
          ) : (
            <Button
              type="filled"
              onPress={() => setLoginVisible(true)}
              label="Logga in/Skapa konto"
              theme={theme}
            />
          )}
        </View>
      </View>
      {theme === "light" && (
        <View
          style={{ marginTop: -1, marginHorizontal: horizontalPadding.desktop }}
        >
          <Divider />
        </View>
      )}
      <SlideInSheet open={openAccount} onClose={() => setOpenAccount(false)}>
        <AccountWrapperDesktop onClose={() => setOpenAccount(false)} />
      </SlideInSheet>
    </View>
  );
}
