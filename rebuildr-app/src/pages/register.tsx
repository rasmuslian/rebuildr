import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { HiddenInput } from "src/components/inputs/hiddenInput";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Body, Title } from "src/components/texts/text";

const REGISTER_USER = gql(`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      message
    }
  }
`);

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createdUser, setCreatedUser] = useState(false);

  const [registerUser, { data, error, loading }] = useMutation(REGISTER_USER);

  const onSubmit = () => {
    if (loading) {
      return;
    }

    //TODO: validate input

    registerUser({
      variables: { input: { email: email, password: password } },
      onCompleted: (data) => {
        if (!data.registerUser.message) {
          setCreatedUser(true);
          //Reset
          setEmail("");
          setPassword("");
        }
      },
    });
  };

  return (
    <Page title="Registrera konto">
      {createdUser ? (
        <Title>Skapat användare!</Title>
      ) : (
        <View style={styles.formContainer}>
          <Input
            placeholder="E-post"
            onChange={setEmail}
            disabled={loading}
            value={email}
          />
          <HiddenInput
            placeholder="Lösenord"
            onChange={setPassword}
            value={password}
            disabled={loading}
          />
          <Button onPress={onSubmit} disabled={loading}>
            <Body>Skicka</Body>
          </Button>
        </View>
      )}
      <Body>{error?.message || data?.registerUser.message}</Body>
    </Page>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 20,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
});
