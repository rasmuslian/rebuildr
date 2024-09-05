import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import Colors from "src/styles/colors";
import { Button } from "../button";
import logo from "assets/images/logo.png";
import { Link, useNavigation } from "@react-navigation/native";
import { Body } from "../texts/text";
import { UserRoleEnum } from "src/gql/graphql";
import { Icon } from "../icons/icon";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

interface LoggedInNavbarProps {
  me: { email: string; role: UserRoleEnum };
}

export const LoggedInNavbar = ({ me }: LoggedInNavbarProps) => {
  const { navigate } = useNavigation();
  const responsiveStyles = useResponsiveStyles(styles);

  return (
    <View style={[styles.container]}>
      <Pressable onPress={() => navigate("Landing")}>
        <Image source={logo} />
      </Pressable>
      <View style={styles.ctaButtons}>
        <Link to={{ screen: "Account" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon iconType="Person" />
            <Body style={responsiveStyles.removeOnMobile}>{me.email}</Body>
          </View>
        </Link>
        <Button
          onPress={() => navigate("Sell")}
          title="NY ANNONS"
          style={responsiveStyles.removeOnMobile}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 88,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: Colors.brand,
    paddingHorizontal: 34,
  },
  ctaButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  removeOnMobile: {
    small: {
      display: "none",
    },
  },
});
