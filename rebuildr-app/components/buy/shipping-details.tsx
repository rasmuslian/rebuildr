import {
  BuyProductInitialQuery,
  ShippingDetailsUpdateUserMutation,
  ShippingDetailsUpdateUserMutationVariables,
  ShippingProviderEnum,
} from "@/gql/graphql";
import { Form } from "@components/forms/form";
import { Display } from "@components/typography/text";
import { shippingProviderStrings } from "@constants/shippingProviders";
import { useState } from "react";
import { View } from "react-native";
import { Summary } from "./summary";
import { gql, useMutation } from "@apollo/client";
import { useSubmitSummary } from "@hooks/buy/use-submit-summary";

const SHIPPING_DETAILS_UPDATE_USER = gql`
  mutation ShippingDetailsUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        name
        phoneNumber
        address
        postCode
        city
      }
    }
  }
`;

type Props = {
  initialData: BuyProductInitialQuery;
  shippingPrice: number;
  shippingProvider: ShippingProviderEnum;
  servicePointId: string;
  onBack: () => void;
};

export const ShippingDetails = ({
  initialData,
  shippingPrice,
  shippingProvider,
  servicePointId,
  onBack,
}: Props) => {
  const { submitShipping } = useSubmitSummary();
  const [name, setName] = useState<string>(initialData.me.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState<string>(
    initialData.me.phoneNumber ?? "",
  );
  const [address, setAddress] = useState<string>(initialData.me.address ?? "");
  const [postCode, setPostCode] = useState<string>(
    initialData.me.postCode ?? "",
  );
  const [city, setCity] = useState<string>(initialData.me.city ?? "");

  const [updateUser, { loading: updateUserloading }] = useMutation<
    ShippingDetailsUpdateUserMutation,
    ShippingDetailsUpdateUserMutationVariables
  >(SHIPPING_DETAILS_UPDATE_USER);

  const onToPayment = () => {
    if (updateUserloading) {
      return;
    }
    updateUser({
      variables: {
        input: {
          id: initialData.me.id,
          name,
          phoneNumber,
          address,
          postCode,
          city,
        },
      },
      onCompleted: () => {
        submitShipping(initialData.product.id, servicePointId);
      },
    });
  };

  return (
    <View style={{ gap: 24 }}>
      <Display size="small">Dina uppgifter</Display>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            value: name,
            onChange: (t) => setName(t),
            heading: "För- och efternamn",
          },
          {
            type: "text",
            value: phoneNumber,
            onChange: (t) => setPhoneNumber(t),
            heading: "Telefonnummer",
            description: `För leveransansvarig från ${shippingProviderStrings[shippingProvider]}.`,
          },
          {
            type: "text",
            value: address,
            onChange: (t) => setAddress(t),
            heading: "Gatuadress",
            description:
              "För spårbarhet och identifiering vid eventuell felsortering eller retur.",
          },
          {
            type: "text",
            value: postCode,
            onChange: (t) => setPostCode(t),
            heading: "Postnummer",
            horizontalSize: 1,
          },
          {
            type: "text",
            value: city,
            onChange: (t) => setCity(t),
            heading: "Stad",
            horizontalSize: 2,
          },
        ]}
      />
      <Summary
        text={`Du betalar (ink. frakt ${shippingPrice}`}
        price={initialData.product.price + shippingPrice}
        mainButton={{
          label: "Fortsätt till Betalning",
          onPress: () => {
            onToPayment();
          },
        }}
        secondaryButton={{
          label: "Tillbaka",
          onPress: onBack,
          icon: "arrowLeft",
        }}
        bottomText="Säljaren skickar varan inom 7 dagar."
      />
    </View>
  );
};
