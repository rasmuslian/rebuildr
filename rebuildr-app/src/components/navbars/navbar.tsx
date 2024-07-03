import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import Colors from "src/styles/colors";
import { Button } from "../button";
import logo from "assets/images/logo.png";
import { useNavigation } from "@react-navigation/native";
import { Body } from "../texts/text";

export const Navbar = () => {
  const { navigate } = useNavigation();

  return (
    <View style={style.container}>
      <Pressable onPress={() => navigate("Landing")}>
        <Image source={logo} />
      </Pressable>
      <Button onPress={() => navigate("Login")} icon={"Person"}>
        <Body>Logga in</Body>
      </Button>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    height: 88,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    backgroundColor: Colors.brand,
    paddingHorizontal: 34,
  },
});
