import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/layout/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";

const RESET_PASSWORD = gql(`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input){
      message
    }
  }
`);

export const ResetPassword = () => {
  const [email, setMail] = useState("");

  const [resetPassword, { data, loading }] = useMutation(RESET_PASSWORD);
  const onResetRequest = () => {
    if (loading || !email) {
      return;
    }
    resetPassword({ variables: { input: { email: email } } });
  };

  return (
    <Page title="Reset password">
      {!data && (
        <Body>Skriv in din E-postadress för att återställa lösenordet</Body>
      )}
      {!data && !loading && (
        <>
          <Input placeholder="E-postadress" onChange={setMail} value={email} />
          <Button onPress={onResetRequest} title="Skicka" disabled={!email} />
        </>
      )}
      {loading && <ActivityIndicator />}
      {data && (
        <Body>Ett mail har skickats till {email} med vidare instruktioner</Body>
      )}
    </Page>
  );
};
