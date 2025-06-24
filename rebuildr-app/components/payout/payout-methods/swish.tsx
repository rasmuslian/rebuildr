import { PayoutAccountEnum } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { View, Image } from "react-native";
import Swish from "@assets/images/swish-no-border.png";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { Form } from "@components/forms/form";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";

const CREATE_SWISH_PAYOUT_ACCOUNT = gql`
  mutation CreateSwishPayoutAccount($input: CreatePayoutAccountInput!) {
    createPayoutAccount(input: $input) {
      user {
        id
        selectedPayoutMethod
      }
    }
  }
`;

type Props = {
  onCompleted: () => void;
};

export const PayoutMethodSwish = ({ onCompleted }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [
    createPayoutAccount,
    {
      loading: createPayoutAccountLoading,
      error: createPayoutAccountError,
      reset,
    },
  ] = useMutation(CREATE_SWISH_PAYOUT_ACCOUNT);

  const onConnect = () => {
    if (createPayoutAccountLoading) {
      return;
    }

    createPayoutAccount({
      variables: {
        input: {
          phoneNumber,
          type: PayoutAccountEnum.Swish,
        },
      },
      onCompleted: () => {
        onCompleted();
      },
      onError: () => {},
    });
  };

  return (
    <ScreenLayout
      style={{ flex: 1, gap: 24 }}
      footerComponent={
        <Button
          label="Koppla Swish"
          onPress={onConnect}
          disabled={!phoneNumber.length}
        />
      }
    >
      <View
        style={{
          margin: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={Swish.uri}
          style={{
            width: 187,
            height: 187,
          }}
        />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Koppla din Swish och få betalt snabbare
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Koppla din Swish som utbetalningsmetod så slipper du ledtiden som
        vanliga banköverföringar har.
      </Body>
      <Divider />
      <View>
        <Form
          fields={[
            {
              type: "text",
              heading: "Ditt telefonnummer",
              placeholder: "070 344 566",
              value: phoneNumber,
              onChange: (v) => setPhoneNumber(v),
              error: !!createPayoutAccountError,
              onFocus: () => reset(),
            },
          ]}
        />
      </View>
    </ScreenLayout>
  );
};
