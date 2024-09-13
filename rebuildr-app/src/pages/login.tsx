import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { isLoggedInVar } from "src/apollo/apollo";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { HiddenInput } from "src/components/inputs/hiddenInput";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/layout/page";
import { Body } from "src/components/texts/text";

const LOGIN = gql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        email
      }
    }
  }
`);

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { navigate } = useNavigation();

  const [login, { error, loading }] = useMutation(LOGIN);

  const onLogin = async () => {
    if (loading) {
      return;
    }
    await login({
      variables: {
        input: {
          email: email,
          password: password,
        },
      },
      onCompleted: async (data) => {
        await AsyncStorage.multiSet([
          ["access_token", data.login.accessToken],
          ["refresh_token", data.login.refreshToken],
        ]);
        isLoggedInVar(true);
        navigate("Landing");
      },
    });
  };
  return (
    <Page title="Logga in">
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Input
            onChange={setEmail}
            placeholder={"E-post address"}
            disabled={loading}
          />
          <HiddenInput
            onChange={setPassword}
            placeholder={"Lösenord"}
            disabled={loading}
          />
          <Button onPress={onLogin} disabled={loading}>
            <Body>Logga in</Body>
          </Button>
          <Button onPress={() => navigate("ResetPassword")}>
            <Body>Glömt lösenordet</Body>
          </Button>
          {error && <Body>"Felaktig e-post eller lösenord"</Body>}
          <Button
            title={"Registrera ett konto"}
            onPress={() => navigate("Register")}
          />
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  loginContainer: {
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 20,
    borderColor: "#000",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
});
