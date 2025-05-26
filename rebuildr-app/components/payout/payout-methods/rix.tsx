import {
  CreateBankgiroPayoutAccountMutationVariables,
  CreateRixPayoutAccountMutation,
  PayoutAccountEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { View, Image } from "react-native";
import Bankkonto from "@assets/images/bankkonto.png";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { Form } from "@components/forms/form";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import * as z from "zod";

const CREATE_RIX_PAYOUT_ACCOUNT = gql`
  mutation CreateRixPayoutAccount($input: CreatePayoutAccountInput!) {
    createPayoutAccount(input: $input) {
      user {
        id
        selectedPayoutMethod
      }
    }
  }
`;

const validationObject = z.object({
  clearingNumber: z.string().min(4).max(4),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
});

type Props = {
  onCompleted: () => void;
};

export const PayoutMethodRix = ({ onCompleted }: Props) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [clearingNumber, setClearingNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [
    createPayoutAccount,
    {
      loading: createPayoutAccountLoading,
      error: createPayoutAccountError,
      reset,
    },
  ] = useMutation<
    CreateRixPayoutAccountMutation,
    CreateBankgiroPayoutAccountMutationVariables
  >(CREATE_RIX_PAYOUT_ACCOUNT);

  const onConnect = () => {
    if (createPayoutAccountLoading || !valid.success) {
      return;
    }

    createPayoutAccount({
      variables: {
        input: {
          type: PayoutAccountEnum.Rix,
          accountNumber,
          accountName,
          clearingNumber,
        },
      },
      onCompleted: () => {
        onCompleted();
      },
      onError: () => {},
    });
  };
  const valid = validationObject.safeParse({
    clearingNumber,
    accountNumber,
    accountName,
  });

  return (
    <ScreenLayout
      style={{ flex: 1, gap: 24 }}
      footerComponent={
        <Button
          label="Koppla Bankkonto"
          onPress={onConnect}
          disabled={!valid.success}
        />
      }
    >
      <View
        style={{
          marginVertical: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={Bankkonto.uri}
          style={{
            width: 187,
            height: 187,
          }}
        />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Koppla ditt Bankkonto för enkla utbetalningar
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Få dina utbetalningar direkt till företagets Bankkonto så ser vi till
        att utbetalningarna hamnar rätt.
      </Body>
      <Divider />
      <View>
        <Form
          style={{ gap: 24 }}
          fields={[
            {
              type: "text",
              heading: "Kontonummmer",
              placeholder: "0123456789",
              value: accountNumber,
              onChange: (v) => setAccountNumber(v),
              inputType: "numeric",
              error: !!createPayoutAccountError,
              onFocus: () => reset(),
            },
            {
              type: "text",
              heading: "Clearingnummber",
              placeholder: "8000",
              value: clearingNumber,
              onChange: (v) => setClearingNumber(v),
              inputType: "numeric",
              error: !!createPayoutAccountError,
              onFocus: () => reset(),
            },
            {
              type: "text",
              heading: "Kontonamn",
              placeholder: "Privatkonto",
              value: accountName,
              onChange: (v) => setAccountName(v),
              error: !!createPayoutAccountError,
              onFocus: () => reset(),
            },
          ]}
        />
      </View>
    </ScreenLayout>
  );
};
