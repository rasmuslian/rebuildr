import React from "react";
import { StyleSheet, View, Image } from "react-native";
import Colors from "src/styles/colors";
import { Body, FooterText, Title } from "./texts/text";
import logoWhite from "assets/images/logoWhite.png";
import linkedIn from "assets/images/linkedIn.png";
import instagram from "assets/images/instagram.png";
import { Link } from "@react-navigation/native";

const content = [
  {
    title: "Om företaget",
    links: ["Tetur adipiscing", "Commodo consequat", "Laboriosam"],
  },
  {
    title: "Så funkar det",
    links: ["Tetur adipiscing", "Commodo consequat", "Laboriosam"],
  },
  {
    title: "För företag",
    links: ["Tetur adipiscing", "Commodo consequat", "Laboriosam"],
  },
  {
    title: "Kontakt & hjälp",
    links: ["Tetur adipiscing", "Commodo consequat", "Laboriosam"],
  },
];

export const Footer = () => {
  const renderLinkColumn = (title: string, links: string[], key: number) => {
    return (
      <View style={styles.linkColumn} key={key}>
        <Title type="small" color="white" upperCase>
          {title}
        </Title>
        {links.map((link, i) => (
          <Link to={{ screen: "Landing" }} key={i}>
            <Body color="white">{link}</Body>
          </Link>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.linksContainer}>
        {content.map((c, i) => renderLinkColumn(c.title, c.links, i))}
      </View>
      <View style={styles.lowerPart}>
        <FooterText color="white" style={styles.fadeText}>
          Följ oss på
        </FooterText>
        <View style={styles.logoAndSocialsPart}>
          <View style={styles.socials}>
            <Image source={instagram} />
            <Image source={linkedIn} />
          </View>
          <Image source={logoWhite} />
        </View>
        <View style={styles.divider} />
        <FooterText color="white" style={styles.fadeText}>
          © 2024 Rebuildr. All rights reserved.
        </FooterText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.green,
    paddingHorizontal: 80,
    paddingVertical: 60,
  },
  linksContainer: {
    flexDirection: "row",
    gap: 70,
    marginBottom: 85,
  },
  linkColumn: {
    gap: 20,
    flex: 1,
  },
  lowerPart: {
    gap: 17,
  },
  logoAndSocialsPart: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
  },
  socials: {
    flexDirection: "row",
    gap: 12,
  },
  divider: {
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: Colors.white,
    opacity: 0.4,
  },
  fadeText: {
    opacity: 0.5,
  },
});
