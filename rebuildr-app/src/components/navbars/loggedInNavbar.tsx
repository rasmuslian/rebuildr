import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import Colors from "src/styles/colors";
import { Button } from "../button";
import logo from "assets/images/logo.png";
import { useNavigation } from "@react-navigation/native";
import { isLoggedInVar } from "src/apollo/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApolloClient } from "@apollo/client";
import { Body } from "../texts/text";

interface LoggedInNavbarProps {
  me: { email: string };
}

export const LoggedInNavbar = ({ me }: LoggedInNavbarProps) => {
  const { navigate } = useNavigation();
  const client = useApolloClient();

  const onLogout = async () => {
    await client.clearStore();
    await AsyncStorage.removeItem("access_token");
    isLoggedInVar(false);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigate("Landing")}>
        <Image source={logo} />
      </Pressable>
      <Body>{me.email}</Body>
      <View style={styles.ctaButtons}>
        <Button
          onPress={() => navigate("Conversations")}
          title={"Meddelanden"}
        />
        <Button onPress={() => navigate("Sell")} title={"Sälj"}></Button>
        <Button onPress={onLogout} icon={"Person"}>
          <Body>Logga ut</Body>
        </Button>
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
    width: "100%",
    backgroundColor: Colors.blue,
    paddingHorizontal: 34,
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 4,
  },
});
