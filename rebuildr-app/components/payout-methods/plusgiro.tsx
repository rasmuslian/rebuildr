import {
  CreatePlusgiroPayoutAccountMutation,
  CreatePlusgiroPayoutAccountMutationVariables,
  PayoutAccountEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { View, Image } from "react-native";
import PlusGiro from "@assets/images/plusgiro.png";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { Form } from "@components/forms/form";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import * as z from "zod";

const CREATE_PLUSGIRO_PAYOUT_ACCOUNT = gql`
  mutation CreatePlusgiroPayoutAccount($input: CreatePayoutAccountInput!) {
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

export const PayoutMethodPlusgiro = ({ onCompleted }: Props) => {
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
    CreatePlusgiroPayoutAccountMutation,
    CreatePlusgiroPayoutAccountMutationVariables
  >(CREATE_PLUSGIRO_PAYOUT_ACCOUNT);

  const onConnect = () => {
    if (createPayoutAccountLoading || !valid.success) {
      return;
    }

    createPayoutAccount({
      variables: {
        input: {
          type: PayoutAccountEnum.Plusgiro,
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
          label="Koppla Plusgirokonto"
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
          source={PlusGiro.uri}
          style={{
            width: 187,
            height: 187,
          }}
        />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Koppla ditt Plusgiro för enkla utbetalningar
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Få dina utbetalningar direkt till företagets Plusgiro så ser vi till att
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
              placeholder: "Mitt Plusgiro",
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
