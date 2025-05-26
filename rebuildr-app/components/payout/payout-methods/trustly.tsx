import {
  CreateTrustlyPayoutAccountMutation,
  CreateTrustlyPayoutAccountMutationVariables,
  PayoutAccountEnum,
  SelectTrustlyPayoutMethodMutation,
  SelectTrustlyPayoutMethodMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useEffect } from "react";
import { View, Image, Platform } from "react-native";
import Trustly from "@assets/images/trustly.png";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { createURL } from "expo-linking";
import { useLocalSearchParams, usePathname } from "expo-router";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import * as Linking from "expo-linking";

const CREATE_TRUSTLY_PAYOUT_ACCOUNT = gql`
  mutation CreateTrustlyPayoutAccount($input: CreatePayoutAccountInput!) {
    createPayoutAccount(input: $input) {
      user {
        id
        selectedPayoutMethod
      }
      trustlyUrl
    }
  }
`;

const SELECT_TRUSTLY_PAYOUT_METHOD = gql`
  mutation SelectTrustlyPayoutMethod($input: SelectPayoutMethodInput!) {
    selectPayoutMethod(input: $input) {
      id
      selectedPayoutMethod
    }
  }
`;

type Props = {
  onCompleted: () => void;
  onFailure: () => void;
};

export const PayoutMethodTrustly = ({ onCompleted, onFailure }: Props) => {
  const { result } = useLocalSearchParams<{ result?: string }>();

  const path = usePathname();

  const [
    createPayoutAccount,
    { loading: createPayoutAccountLoading, error: createPayoutAccountError },
  ] = useMutation<
    CreateTrustlyPayoutAccountMutation,
    CreateTrustlyPayoutAccountMutationVariables
  >(CREATE_TRUSTLY_PAYOUT_ACCOUNT);
  const [selectPayoutMethod] = useMutation<
    SelectTrustlyPayoutMethodMutation,
    SelectTrustlyPayoutMethodMutationVariables
  >(SELECT_TRUSTLY_PAYOUT_METHOD);
  const resultSuccess = "success";
  const resultFailure = "failure";

  const onConnect = () => {
    let url = "";
    if (Platform.OS === "web") {
      url = window.location.origin + path;
    }
    if (Platform.OS === "ios" || Platform.OS === "android") {
      url = "rebuildr://" + path;
    }
    const successUrl = createURL(url, {
      queryParams: { result: resultSuccess },
    });
    const failureUrl = createURL(url, {
      queryParams: { result: resultFailure },
    });

    createPayoutAccount({
      variables: {
        input: {
          successUrl,
          failureUrl,
          type: PayoutAccountEnum.Trustly,
        },
      },
      onCompleted: async (data) => {
        if (!data.createPayoutAccount.trustlyUrl) {
          onFailure();
          return;
        }
        const canOpen = await Linking.canOpenURL(
          data.createPayoutAccount.trustlyUrl,
        );
        if (!canOpen) {
          onFailure();
          return;
        }
        await Linking.openURL(data.createPayoutAccount.trustlyUrl);
      },
      onError: () => {},
    });
  };

  useEffect(() => {
    //path is not always ready when this useeffect fires. Makes sure path is populated before continuing
    if (!path || path === "/") {
      return;
    }
    if (!result) {
      onConnect();
    }

    if (result === resultSuccess) {
      selectPayoutMethod({
        variables: { input: { method: PayoutAccountEnum.Trustly } },
        onCompleted: () => {
          onCompleted();
        },
        onError: () => {
          onFailure();
        },
      });
    }
    if (result === resultFailure) {
      onFailure();
    }
  }, [result, path]);

  return (
    <ScreenLayout style={{ flex: 1, gap: 24 }}>
      <View
        style={{
          marginVertical: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={Trustly.uri}
          style={{
            width: 187,
            height: 187,
          }}
        />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Trustly
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Följ instruktionerna för att koppla ditt bankkonto med Trustly
      </Body>
      {createPayoutAccountLoading && <LoadingSpinner />}
      {createPayoutAccountError && <Body color="error">Något gick fel</Body>}
      <Divider />
    </ScreenLayout>
  );
};
