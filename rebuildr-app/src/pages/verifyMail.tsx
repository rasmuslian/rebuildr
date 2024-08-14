import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { isLoggedInVar } from "src/apollo/apollo";
import { Page } from "src/components/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";

const VERIFY_MAIL = gql(`
  mutation VerifyMail($input: VerifyMailInput!) {
    verifyMail(input: $input) {
      accessToken
      refreshToken
    }
  }
`);

export const VerifyMail = ({ route }) => {
  const [verifyMail, { error }] = useMutation(VERIFY_MAIL);

  useEffect(() => {
    const { email, token } = route.params;

    verifyMail({
      variables: { input: { email, verifyEmailToken: token } },
      onCompleted: async (data) => {
        await AsyncStorage.multiSet([
          ["access_token", data.verifyMail.accessToken],
          ["refresh_token", data.verifyMail.refreshToken],
        ]);
        isLoggedInVar(true);
      },
    });
  }, [route.params, verifyMail]);

  return (
    <Page title="Verifiera mail">
      {error ? (
        <View>
          <Body>Verifieringsmailet är inte längre giltigt</Body>
        </View>
      ) : (
        <View>
          <Body>Verifierar...</Body>
          <ActivityIndicator />
        </View>
      )}
    </Page>
  );
};
