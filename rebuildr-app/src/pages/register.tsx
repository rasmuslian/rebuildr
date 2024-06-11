import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/apollo/__generated__/gql";
import { Button } from "src/components/button";
import { HiddenInput } from "src/components/inputs/hiddenInput";
import { Input } from "src/components/inputs/input";
import { Text, textStyles } from "../components/text";

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
  const [registering, setRegistering] = useState(false);

  const [registerUser, { data, error }] = useMutation(REGISTER_USER);

  const onSubmit = () => {
    if (registering) {
      return;
    }

    setRegistering(true);
    //TODO: validate input

    registerUser({
      variables: { input: { email: email, password: password } },
    });

    if (!error && !data.registerUser.message) {
      //Reset
      setEmail("");
      setPassword("");
    }
    setRegistering(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[textStyles.title, styles.title]}>Registrera konto</Text>

      <View style={styles.formContainer}>
        <Input
          placeholder="E-post"
          onChange={setEmail}
          disabled={registering}
        />
        <HiddenInput
          placeholder="Lösenord"
          onChange={setPassword}
          disabled={registering}
        />
        <Button onPress={onSubmit} disabled={registering}>
          <Text>Skicka</Text>
        </Button>
      </View>
      <Text>{error?.message || data?.registerUser.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    display: "flex",
  },
  title: {
    marginBottom: 40,
  },
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
