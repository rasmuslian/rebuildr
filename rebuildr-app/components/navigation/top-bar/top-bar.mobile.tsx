import { View, Pressable } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
import { LoginModalContext } from "@context/loginModalContext";
import { PropsWithChildren, useContext } from "react";
import { Logo } from "@components/logo/logo";
import { showHamburgerMenuVar } from "@/apollo/config";
import { GetMeQuery } from "@/gql/graphql";
import { Avatar } from "@components/avatar/avatar";

type Props = {
  isLoggedIn: boolean;
  me?: GetMeQuery["me"];
};

export default function TopBarMobile({ isLoggedIn, me }: Props) {
  const colors = useThemeColor();
  const { setVisible } = useContext(LoginModalContext);
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
        <Logo width={89} height={18} />
      </Pressable>

      <View style={{ display: "flex", flexDirection: "row" }}>
        <ActionButton
          onPress={() => {
            if (isLoggedIn) {
              router.navigate("/account/favorites");
            } else {
              setVisible(true);
            }
          }}
        >
          <Icon
            icon="heart"
            customColor={colors.logo.background}
            width={18}
            height={18}
          />
        </ActionButton>

        <ActionButton
          onPress={() => {
            if (isLoggedIn) {
              router.navigate("/(app)/account");
            } else {
              setVisible(true);
            }
          }}
        >
          {me ? (
            <Avatar imageUrl={me?.profilePicture?.url} size={24} />
          ) : (
            <Icon
              icon="user"
              customColor={colors.logo.background}
              width={18}
              height={18}
            />
          )}
        </ActionButton>

        <ActionButton onPress={() => showHamburgerMenuVar(true)}>
          <Icon
            icon="hamburger"
            customColor={colors.logo.background}
            width={18}
            height={18}
          />
        </ActionButton>
      </View>
    </View>
  );
}

type ActionButtonProps = {
  onPress: () => void;
} & PropsWithChildren;

const ActionButton = ({ onPress, children }: ActionButtonProps) => {
  return (
    <Pressable
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
      }}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};
