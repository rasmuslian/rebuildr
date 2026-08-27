import { useQuery } from "@apollo/client";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";

import { showHamburgerMenuVar } from "@/apollo/config";
import { GetMeQuery, TabLayoutQuery } from "@/gql/graphql";
import { TAB_LAYOUT } from "@/queries";
import {
  AccountState,
  AccountWrapperDesktop,
} from "@components/account/account-wrapper.desktop";
import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Icon, IconType } from "@icons/icon";
import { Logo } from "@components/logo/logo";
import { SearchBar } from "@components/search/search-bar";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { horizontalPadding } from "@constants/sizes";
import { LoginModalContext } from "@context/loginModalContext";
import { useSearchContext } from "@context/search-context";
import { useSellProductContext } from "@context/sell-product-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useThemeColor } from "@hooks/useThemeColor";
import { MAX_CONTENT_WIDTH } from "@constants/layout";

type Props = {
  isLoggedIn: boolean;
  theme: "light" | "dark";
  showSearchBar?: boolean;
  animateSearchBar?: boolean;
  me?: GetMeQuery["me"];
  sellButtonLabel?: string;
  onSellButtonPress?: () => void;
  backgroundColor?: string;
  foregroundColor?: string;
  showBottomBorder?: boolean;
  categoriesButtonBackgroundColor?: string;
  searchScope?: "public" | "internal";
};

export default function TopBarDesktop({
  isLoggedIn,
  theme,
  showSearchBar = true,
  animateSearchBar = false,
  me,
  sellButtonLabel,
  onSellButtonPress,
  backgroundColor,
  foregroundColor,
  showBottomBorder = true,
  categoriesButtonBackgroundColor,
  searchScope = "public",
}: Props) {
  const searchContext = useSearchContext();
  const { filterBuilder } = useFilterProduct();
  const colors = useThemeColor();
  const pathname = usePathname();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const [openAccount, setOpenAccount] = useState<AccountState["page"] | false>(
    false,
  );
  const params = useLocalSearchParams();

  const searchOpacity = useRef(new Animated.Value(0)).current;
  const { data: tabData } = useQuery<TabLayoutQuery>(TAB_LAYOUT);

  useEffect(() => {
    if (!openAccount && params.account && isLoggedIn) {
      setOpenAccount(params.account as AccountState["page"]);
    }
  }, [params.account, isLoggedIn]);

  // The panel is opened from an `account` query param. Leaving it behind means
  // re-navigating to the same page never changes the param, so the panel would
  // refuse to reopen.
  const closeAccount = () => {
    setOpenAccount(false);
    if (params.account) router.setParams({ account: undefined });
  };

  useEffect(() => {
    if (params.category === "all") {
      showHamburgerMenuVar(true);
    }
  }, [params.category]);

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
        setOpenAccount("index");
      },
      active: false,
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
          backgroundColor:
            backgroundColor ??
            (theme === "light"
              ? colors.background.neutral
              : colors.logo.vector),
          height: 72,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            alignSelf: "center",
            height: "100%",
            paddingHorizontal: horizontalPadding.desktop,
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 32 }}>
            <Pressable
              onPress={() => {
                filterBuilder.reset().apply();
                searchContext.reset();
                router.navigate("/");
              }}
            >
              <Logo
                width={118}
                height={24}
                customColor={
                  foregroundColor ??
                  (theme === "light" ? colors.logo.vector : undefined)
                }
              />
            </Pressable>
            <Animated.View style={{ opacity: searchOpacity }}>
              <SearchBar
                visible={showSearchBar}
                searchOnSubmit
                searchScope={searchScope}
                placeholder={
                  searchScope === "internal"
                    ? "Sök i Återbanken"
                    : "Vad letar du efter?"
                }
                style={{ borderBottomWidth: 0, width: 320 }}
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
                  (
                    { icon, onPress, badgeNumber, avatarUrl, active },
                    index,
                  ) => (
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
                            size={26}
                            color={
                              theme === "dark" ? "primaryLight" : "primaryDark"
                            }
                          />
                        ) : (
                          <Avatar imageUrl={avatarUrl} size={30} />
                        )}
                        {!!badgeNumber && (
                          <View
                            style={{ position: "absolute", right: 2, top: 2 }}
                          >
                            <Badge
                              text={badgeNumber.toString()}
                              theme={theme}
                            />
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
              style={
                categoriesButtonBackgroundColor
                  ? { backgroundColor: categoriesButtonBackgroundColor }
                  : undefined
              }
            />
            {isLoggedIn ? (
              <Button
                type="filled"
                onPress={
                  onSellButtonPress ?? (() => setSellProductVisible(true))
                }
                label={sellButtonLabel ?? "Ny annons"}
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
      </View>
      {theme === "light" && showBottomBorder && (
        <View
          style={{
            marginTop: -1,
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            alignSelf: "center",
            paddingHorizontal: horizontalPadding.desktop,
          }}
        >
          <Divider />
        </View>
      )}
      <SlideInSheet open={!!openAccount} onClose={closeAccount}>
        <AccountWrapperDesktop
          onClose={closeAccount}
          initialPage={openAccount}
        />
      </SlideInSheet>
    </View>
  );
}
