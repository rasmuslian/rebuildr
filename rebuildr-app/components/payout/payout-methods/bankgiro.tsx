import {
  CreateBankgiroPayoutAccountMutation,
  CreateBankgiroPayoutAccountMutationVariables,
  PayoutAccountEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { View, Image } from "react-native";
import BankGiro from "@assets/images/bankgiro.png";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { Form } from "@components/forms/form";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import * as z from "zod";

const CREATE_BANKGIRO_PAYOUT_ACCOUNT = gql`
  mutation CreateBankgiroPayoutAccount($input: CreatePayoutAccountInput!) {
    createPayoutAccount(input: $input) {
      user {
        id
        selectedPayoutMethod
      }
    }
  }
`;

const validationObject = z.object({
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
});

type Props = {
  onCompleted: () => void;
};

export const PayoutMethodBankgiro = ({ onCompleted }: Props) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [
    createPayoutAccount,
    {
      loading: createPayoutAccountLoading,
      error: createPayoutAccountError,
      reset,
    },
  ] = useMutation<
    CreateBankgiroPayoutAccountMutation,
    CreateBankgiroPayoutAccountMutationVariables
  >(CREATE_BANKGIRO_PAYOUT_ACCOUNT);

  const onConnect = () => {
    if (createPayoutAccountLoading || !valid.success) {
      return;
    }

    createPayoutAccount({
      variables: {
        input: {
          type: PayoutAccountEnum.Bankgiro,
          identifier: accountNumber,
          accountName,
        },
      },
      onCompleted: () => {
        onCompleted();
      },
      onError: () => {},
    });
  };
  const valid = validationObject.safeParse({
    accountNumber,
    accountName,
  });

  return (
    <ScreenLayout
      style={{ flex: 1, gap: 24 }}
      footerComponent={
        <Button
          label="Koppla Bankgirokonto"
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
          source={BankGiro.uri}
          style={{
            width: 187,
            height: 187,
          }}
        />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Koppla ditt Bankgiro för enkla utbetalningar
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Få dina utbetalningar direkt till företagets Bankgiro så ser vi till att
        utbetalningarna hamnar rätt.
      </Body>
      <Divider />
      <View>
        <Form
          style={{ gap: 24 }}
          fields={[
            {
              type: "text",
              heading: "Kontonummmer",
              placeholder: "11223344",
              value: accountNumber,
              onChange: (v) => setAccountNumber(v),
              inputType: "numeric",
              error: !!createPayoutAccountError,
              onFocus: () => reset(),
            },
            {
              type: "text",
              heading: "Kontonamn",
              placeholder: "Mitt Bankgiro",
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
