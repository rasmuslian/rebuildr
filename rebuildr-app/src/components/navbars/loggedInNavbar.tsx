import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import Colors from "src/styles/colors";
import { Button } from "../button";
import { Text } from "../text";
import logo from "assets/images/logo.png";
import { useNavigation } from "@react-navigation/native";
import { isLoggedInVar } from "src/apollo/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApolloClient } from "@apollo/client";

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
    <View style={style.container}>
      <Pressable onPress={() => navigate("Landing")}>
        <Image source={logo} />
      </Pressable>
      <Text>{me.email}</Text>
      <Button onPress={onLogout} icon={"person"}>
        <Text>Logga ut</Text>
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
    backgroundColor: Colors.blue,
    paddingHorizontal: 34,
  },
});
