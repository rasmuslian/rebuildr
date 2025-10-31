import { Logo } from "@components/logo/logo";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { showHamburgerMenuVar } from "@/apollo/config";
import { Icon, IconType } from "@icons/icon";
import { Button } from "@components/buttons/button";
import { useContext } from "react";
import { LoginModalContext } from "@context/loginModalContext";
import { useSellProductContext } from "@context/sell-product-context";
import { useQuery } from "@apollo/client";
import { TabLayoutQuery } from "@/gql/graphql";
import { TAB_LAYOUT } from "@/app/(app)/(tabs)/_layout";
import { Badge } from "@components/badges/badge";
import { Divider } from "@components/dividers/divider";

export default function TopBarDesktop({
  isLoggedIn,
  theme,
}: {
  isLoggedIn: boolean;
  theme: "light" | "dark";
}) {
  const colors = useThemeColor();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { setVisible: setSellProductVisible } = useSellProductContext();

  const { data: tabData } = useQuery<TabLayoutQuery>(TAB_LAYOUT);

  const icons: { icon: IconType; onPress: () => void; badgeNumber?: number }[] =
    [
      {
        icon: "user",
        onPress: () => {
          router.navigate("/(app)/account");
        },
      },
      {
        icon: "heart",
        onPress: () => {
          router.navigate("/account/favorites");
        },
      },
      {
        icon: "message",
        onPress: () => {
          router.navigate("/conversations");
        },
        badgeNumber: tabData?.getUnreadConversationsCount,
      },
    ];

  return (
    <View>
      <View
        style={{
          width: "100%",
          paddingHorizontal: 75,
          backgroundColor:
            theme === "light" ? colors.background.neutral : colors.logo.vector,
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          height: 72,
        }}
      >
        <Pressable onPress={() => router.navigate("/")}>
          <Logo
            width={118}
            height={24}
            customColor={theme === "light" ? colors.logo.vector : undefined}
          />
        </Pressable>
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
              icons.map(({ icon, onPress, badgeNumber }, index) => (
                <Pressable key={index} onPress={onPress}>
                  <View
                    style={{
                      position: "relative",
                      height: 40,
                      width: 40,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      icon={icon}
                      size={18}
                      color={theme === "dark" ? "primaryLight" : "primaryDark"}
                    />
                    {!!badgeNumber && (
                      <View style={{ position: "absolute", right: 2, top: 2 }}>
                        <Badge text={badgeNumber.toString()} theme={theme} />
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
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
        <View style={{ marginTop: -1, marginHorizontal: 75 }}>
          <Divider />
        </View>
      )}
    </View>
  );
};