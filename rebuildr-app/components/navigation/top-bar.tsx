import { View, Pressable, Appearance } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { router } from "expo-router";
import { LoginModalContext } from "@context/loginModalContext";
import { useContext } from "react";
import { useUser } from "@hooks/useUser";
import { Image } from "expo-image";

import logoLight from "@assets/images/logo-light.png";
import logoDark from "@assets/images/logo-dark.png";

export default function TopBar() {
  const colorScheme = Appearance.getColorScheme();
  const colors = useThemeColor();
  const { setVisible } = useContext(LoginModalContext);
  const { isLoggedIn } = useUser();

  const icons: { icon: IconType; onPress: () => void }[] = [
    {
      icon: "heart",
      onPress: () => {
        if (isLoggedIn) {
          router.navigate("/account/favorites");
        } else {
          setVisible(true);
        }
      },
    },
    {
      icon: "user",
      onPress: () => {
        if (isLoggedIn) {
          router.navigate("/(app)/account");
        } else {
          setVisible(true);
        }
      },
    },
    {
      icon: "hamburger",
      onPress: () => {
        console.log("pressed hamburger");
      },
    },
  ];

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 16,
        backgroundColor: colors.logo.vector,
        justifyContent: "space-between",
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        height: 56,
      }}
    >
      <Pressable onPress={() => router.navigate("/")}>
        <Image
          source={colorScheme === "dark" ? logoDark.uri : logoLight.uri}
          style={{
            width: 100,
            height: 20,
          }}
        />
      </Pressable>

      <View style={{ display: "flex", flexDirection: "row" }}>
        {icons.map(({ icon, onPress }, index) => (
          <Pressable
            key={index}
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 40,
              height: 40,
            }}
            onPress={onPress}
          >
            <Icon
              strokeColor="icon"
              color="icon"
              icon={icon}
              width={18}
              height={18}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
