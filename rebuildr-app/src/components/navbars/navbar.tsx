import React from "react";
import { View, Image, Pressable } from "react-native";
import Colors from "src/styles/colors";
import { Button } from "../button";
import logo from "assets/images/logo.png";
import { Link, useNavigation } from "@react-navigation/native";
import { Body, InputText } from "../texts/text";
import { UserRoleEnum } from "src/gql/graphql";
import { Icon } from "../icons/icon";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

interface NavbarProps {
  me?: { email: string; role: UserRoleEnum };
}

export const Navbar = ({ me }: NavbarProps) => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);

  return (
    <View style={[styles.container]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={[
            styles.removeOnMobile,
            {
              marginRight: 32,
            },
          ]}
        >
          <Menu />
        </View>
        <Pressable onPress={() => navigate("Landing")}>
          <Image source={logo} />
        </Pressable>
      </View>
      <View style={[styles.ctaButtons, styles.removeOnMobile]}>
        {me ? (
          <Link to={{ screen: "Account" }}>
            <View style={styles.accountButton}>
              <Icon iconType="Person" />
              <Body>{me.email}</Body>
            </View>
          </Link>
        ) : (
          <Link to={{ screen: "Login" }}>
            <View style={styles.accountButton}>
              <Icon iconType="Person" />
              <Body>Logga in</Body>
            </View>
          </Link>
        )}
        {me ? (
          <Button
            onPress={() => navigate("Sell")}
            title="NY ANNONS"
            style={styles.removeOnMobile}
          />
        ) : (
          <Button
            onPress={() => navigate("Login")}
            icon={"Person"}
            title="SKAPA KONTO"
          />
        )}
      </View>
      <View style={styles.removeOnDesktop}>
        <Menu />
      </View>
    </View>
  );
};

const responsiveStyles = {
  container: {
    height: 88,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: Colors.brand,
    paddingHorizontal: 34,
    small: {
      paddingHorizontal: 22,
    },
  },
  ctaButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  accountButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeOnMobile: {
    small: {
      display: "none",
    },
  },
  removeOnDesktop: {
    display: "none",
    small: {
      display: undefined,
    },
  },
} as const;

const Menu = () => {
  const styles = useResponsiveStyles(menuStyles);
  return (
    <View style={styles.container}>
      <Pressable>
        <View style={styles.lines}>
          <View style={styles.fullLine} />
          <View style={styles.halfLine} />
          <View style={styles.fullLine} />
        </View>
      </Pressable>
      <InputText color="brandGreen" style={styles.text}>
        Meny
      </InputText>
    </View>
  );
};

const menuStyles = {
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  lines: { gap: 4, flex: 1, width: 26 },
  fullLine: {
    width: "100%",
    borderStyle: "solid",
    borderColor: Colors.brandGreen,
    borderWidth: 1.5,
  },
  halfLine: {
    width: "50%",
    borderStyle: "solid",
    borderColor: Colors.brandGreen,
    borderWidth: 1.5,
  },
  text: {
    small: {
      display: "none",
    },
  },
} as const;
