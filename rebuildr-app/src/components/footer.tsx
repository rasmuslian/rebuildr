import React from "react";
import { StyleSheet, View, Image } from "react-native";
import Colors from "src/styles/colors";
import { FooterText } from "./texts/text";
import logoWhite from "assets/images/logoWhite.png";
import linkedIn from "assets/images/linkedIn.png";
import instagram from "assets/images/instagram.png";

export const Footer = () => {
  return (
    <View style={styles.container}>
      <FooterText color="white">Följ oss på</FooterText>
      <View style={styles.middlePart}>
        <Image source={instagram} />
        <Image source={linkedIn} />
        <View style={styles.divider} />
        <Image source={logoWhite} />
      </View>
      <FooterText color="white">
        © 2024 Rebuildr. All rights reserved.
      </FooterText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.green,
    height: 185,
    paddingHorizontal: 80,
    justifyContent: "center",
    gap: 20,
  },
  middlePart: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  divider: {
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: Colors.white,
    flex: 1,
  },
});
