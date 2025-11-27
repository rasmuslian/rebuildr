import {
  AccountSettingsUpdateUserMutation,
  AccountSettingsUpdateUserMutationVariables,
  AccountSettingsUserQuery,
} from "@/gql/graphql";
import { formatSwedishNumber, formatPostCode } from "@/utils/formattings";
import { useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Entry } from "./entry";
import { ACCOUNT_SETTINGS_UPDATE_USER } from "./queries";

type Props = {
  user: AccountSettingsUserQuery["me"];
};
export const PickupAddressSetting = ({ user }: Props) => {
  const [name, setName] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [postCode, setPostCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [updateUser, { loading: updateUserLoading }] = useMutation<
    AccountSettingsUpdateUserMutation,
    AccountSettingsUpdateUserMutationVariables
  >(ACCOUNT_SETTINGS_UPDATE_USER);

  const onSaveHomeDetails = () => {
    if (
      updateUserLoading ||
      (!name && !phoneNumber && !address && !postCode && !city)
    ) {
      return null;
    }

    updateUser({
      variables: {
        input: {
          id: user.id,
          name: name ? name : undefined,
          phoneNumber: phoneNumber ? phoneNumber : undefined,
          address: address ? address : undefined,
          postCode: postCode ? postCode : undefined,
          city: city ? city : undefined,
        },
      },
      onCompleted: () => {
        setName(null);
        setPhoneNumber(null);
        setAddress(null);
        setPostCode(null);
        setCity(null);
      },
      onError: () => {},
    });
  };

  const hasHomeDetails =
    !!user.city &&
    !!user.address &&
    !!user.postCode &&
    !!user.name &&
    !!user.phoneNumber;

  return (
    <View style={{ gap: 16 }}>
      {name === null ||
      phoneNumber === null ||
      address === null ||
      postCode === null ||
      city === null ? (
        <Entry
          title="Leveransadress"
          onPress={() => {
            setName(user.name ?? "");
            setPhoneNumber(user.phoneNumber ?? "");
            setAddress(user.address ?? "");
            setPostCode(user.postCode ?? "");
            setCity(user.city ?? "");
          }}
          isSet={hasHomeDetails}
        >
          {!hasHomeDetails ? (
            <Body size="medium" color="secondary">
              Lägg till adressen dit du vill få varor skickade.
            </Body>
          ) : (
            <View>
              <Body size="medium" color="secondary">
                {user.name}
              </Body>
              <Body size="medium" color="secondary">
                {formatSwedishNumber(user.phoneNumber ?? "")}
              </Body>
              <Body size="medium" color="secondary">
                {user.address}
                {user.postCode
                  ? ", " + formatPostCode(user.postCode)
                  : null}{" "}
                {user.city}
              </Body>
            </View>
          )}
        </Entry>
      ) : (
        <View style={{ gap: 16 }}>
          <Headline size="small">Leveransadress</Headline>
          <Body size="medium">
            Den adress vi använder om du väljer frakt eller hemtransport i ett
            köp.
          </Body>
          <Form
            style={{ gap: 16 }}
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
              },
              {
                type: "text",
                value: address,
                onChange: (t) => setAddress(t),
                heading: "Gatuadress",
              },
              {
                type: "text",
                value: formatPostCode(postCode),
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
          <Button
            label="Spara"
            onPress={onSaveHomeDetails}
            disabled={
              name === user.name &&
              phoneNumber === user.phoneNumber &&
              address === user.address &&
              postCode === user.postCode &&
              city === user.city
            }
          />
        </View>
      )}
    </View>
  );
};
