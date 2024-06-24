import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
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
    }
  }
`);

export const VerifyMail = ({ route }) => {
  const { navigate } = useNavigation();
  const [verifyMail] = useMutation(VERIFY_MAIL);
  useEffect(() => {
    const { email, token } = route.params;

    verifyMail({
      variables: { input: { email, verifyEmailToken: token } },
      onCompleted: async (data) => {
        await AsyncStorage.setItem("access_token", data.verifyMail.accessToken);
        isLoggedInVar(true);
        navigate("Landing");
      },
    });
  }, [navigate, route.params, verifyMail]);

  return (
    <Page title="Verifiera mail">
      <View>
        <Body>Verifierar...</Body>
        <ActivityIndicator />
      </View>
    </Page>
  );
};
