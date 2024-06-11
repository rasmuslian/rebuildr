import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Button } from "src/components/button";

export const Login = () => {
  const { navigate } = useNavigation();
  return (
    <View style={style.container}>
      <TextInput defaultValue="Logga in" />
      <Button
        title={"Registrera ett konto"}
        onPress={() => navigate("Register")}
      />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    marginHorizontal: 64,
    justifyContent: "center",
  },
});
