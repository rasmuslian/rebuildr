import { isLoggedInVar } from "@/apollo/config";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body } from "@components/typography/text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const NEW_PASSWORD = gql`
  mutation NewPassword($input: NewPasswordInput!) {
    newPassword(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const { email, token } = useLocalSearchParams<{
    email: string;
    token: string;
  }>();

  const [newPassword, { loading, error }] = useMutation(NEW_PASSWORD);

  const onRequestNewPassword = () => {
    if (loading) {
      return;
    }

    if (!password) {
      return;
    }

    newPassword({
      variables: {
        input: { email, resetPasswordToken: token, password },
      },
      onCompleted: async (data) => {
        await AsyncStorage.multiSet([
          ["access_token", data.newPassword.accessToken],
          ["refresh_token", data.newPassword.refreshToken],
        ]);
        isLoggedInVar(true);
        router.replace("/");
      },
    });
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Body>Ange nytt lösenord</Body>
        <Form
          fields={[
            {
              type: "masked",
              value: password,
              onChange: (v) => setPassword(v),
              placeholder: "Lösenord",
            },
          ]}
        />
        <Button label="Skicka" onPress={onRequestNewPassword} />
        {error && (
          <Body>
            Något gick fel, verifieringsmailet kan ha blivit ogiltigt. Försök
            att återställa lösenordet på nytt.
          </Body>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
