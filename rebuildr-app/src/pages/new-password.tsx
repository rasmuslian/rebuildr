import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { isLoggedInVar } from "src/apollo/apollo";
import { Button } from "src/components/button";
import { HiddenInput } from "src/components/inputs/hiddenInput";
import { Page } from "src/components/layout/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";

const NEW_PASSWORD = gql(`
  mutation NewPassword($input: NewPasswordInput!) {
    newPassword(input:$input) {
      accessToken
      refreshToken
    }
  }
`);

export const NewPassword = ({ route }) => {
  const [password, setPassword] = useState("");

  const [newPassword, { loading, error }] = useMutation(NEW_PASSWORD);

  const onRequestNewPassword = () => {
    if (loading) {
      return;
    }

    //TODO: verify password
    if (!password) {
      return;
    }

    const { email, token } = route.params;
    newPassword({
      variables: {
        input: { email: email, resetPasswordToken: token, password: password },
      },
      onCompleted: async (data) => {
        await AsyncStorage.multiSet([
          ["access_token", data.newPassword.accessToken],
          ["refresh_token", data.newPassword.refreshToken],
        ]);
        isLoggedInVar(true);
      },
    });
  };

  return (
    <Page title="Skapa nytt lösenord">
      <View style={styles.container}>
        <Body>Ange nytt lösenord</Body>
        <HiddenInput
          onChange={setPassword}
          value={password}
          placeholder={"Lösenord"}
        />
        <Button title="Skicka" onPress={onRequestNewPassword} />
        {error && (
          <Body>
            Något gick fel, verifieringsmailet kan ha blivit ogiltigt. Försök
            att återställa lösenordet på nytt.
          </Body>
        )}
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
