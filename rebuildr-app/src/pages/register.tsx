import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/layout/page";
import { Body, Title } from "src/components/texts/text";
import { HiddenInput } from "src/components/inputs/hiddenInput";

const REGISTER_USER = gql(`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      message
    }
  }
`);

const RESEND_VERIFICATION_MAIL = gql(`
  mutation ResendVerificationMail($input: ResendVerificationMailInput!) {
    resendVerificationMail(input: $input) {
      message
    }
  }
  `);

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationResent, setVerificationResent] = useState(false);

  const [registerUser, { data: registerData, error, loading }] =
    useMutation(REGISTER_USER);
  const [
    resendVerificationMail,
    { data: resendVerificationMailData, loading: resendingVerificationRequest },
  ] = useMutation(RESEND_VERIFICATION_MAIL);

  const onSubmit = () => {
    if (loading) {
      return;
    }

    //TODO: validate input

    registerUser({
      variables: {
        input: { username: username, email: email, password: password },
      },
    });
  };

  const onResendVerificationMail = () => {
    if (resendingVerificationRequest) {
      return;
    }

    resendVerificationMail({
      variables: { input: { email: email } },
      onCompleted: () => setVerificationResent(true),
    });
  };

  return (
    <Page title="Registrera konto">
      {registerData && !registerData.registerUser.message ? (
        <View>
          <Title>Verifikationsmail har skickats till {email}</Title>
          <Body>Inte fått något mail? Titta i skräpposten</Body>
          {resendingVerificationRequest ? (
            <ActivityIndicator />
          ) : (
            <Button
              onPress={onResendVerificationMail}
              title="Skicka mail igen"
            />
          )}
          {verificationResent &&
          resendVerificationMailData &&
          resendVerificationMailData.resendVerificationMail.message ? (
            <Body>
              {resendVerificationMailData.resendVerificationMail.message}
            </Body>
          ) : (
            <Body>Nytt verifikationsmail skickat!</Body>
          )}
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Input
            placeholder="Användarnamn"
            onChange={setUsername}
            disabled={loading}
            value={username}
          />
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
      <Body>{error?.message || registerData?.registerUser.message}</Body>
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
