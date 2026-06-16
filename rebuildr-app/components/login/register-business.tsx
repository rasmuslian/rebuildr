import {
  LookupOrganizationNumberQuery,
  LookupOrganizationNumberQueryVariables,
} from "@/gql/graphql";
import { formatOrgNumber } from "@/utils/formattings";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Display, Title } from "@components/typography/text";
import { gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { View } from "react-native";
import { z } from "zod";
import { Divider } from "@components/dividers/divider";

const LOOKUP_ORGANIZATION = gql`
  query LookupOrganizationNumber($orgNumber: String!) {
    lookupOrganizationNumber(orgNumber: $orgNumber) {
      name
      address
      zipCode
      city
      alreadyRegistered
    }
  }
`;

type Props = {
  onSubmit: (email: string, orgNumber: string) => void;
  initialEmail?: string;
  loading?: boolean;
};

export default function RegisterBusiness({
  onSubmit,
  initialEmail,
  loading,
}: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [orgNumber, setOrgNumber] = useState("");
  const [emailError, setEmailError] = useState(false);

  const [lookupOrg, { data, loading: lookupLoading, error: lookupError }] =
    useLazyQuery<
      LookupOrganizationNumberQuery,
      LookupOrganizationNumberQueryVariables
    >(LOOKUP_ORGANIZATION);

  const isEmailValid = z.string().email().safeParse(email).success;
  const orgResult = data?.lookupOrganizationNumber;
  const notFound = data !== undefined && orgResult === null;

  const onChangeOrgNumber = (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length <= 10) setOrgNumber(digits);
  };

  const handleLookup = () => {
    if (orgNumber.length !== 10) return;
    lookupOrg({ variables: { orgNumber } });
  };

  const handleSubmit = () => {
    if (!isEmailValid) {
      setEmailError(true);
      return;
    }
    onSubmit(email, orgNumber);
  };

  return (
    <View style={{ gap: 24 }}>
      <Display size="small">
        Skriv in din e-post och organisationsnummer för att fortsätta
      </Display>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            heading: "Ange din e-postadress",
            value: email,
            onChangeText: (text) => {
              if (emailError) setEmailError(false);
              setEmail(text);
            },
            inputMode: "email",
            error: emailError ? "Felaktig e-postadress" : undefined,
          },
          {
            type: "text",
            heading: "Organisationsnummer",
            value: formatOrgNumber(orgNumber),
            onChangeText: onChangeOrgNumber,
            inputType: "numeric",
            error:
              notFound || lookupError
                ? "Företag kunde inte hittas"
                : orgResult?.alreadyRegistered
                  ? "Det här organisationsnumret används redan"
                  : undefined,
          },
        ]}
      />
      <Button
        type="outlined"
        label="Hämta organisationsnummer"
        onPress={handleLookup}
        loading={lookupLoading}
        disabled={orgNumber.length !== 10}
      />
      {orgResult && (
        <View style={{ gap: 16, marginTop: 8 }}>
          <Divider />
          <View style={{ gap: 4 }}>
            <Title size="medium">{orgResult.name}</Title>
            <Title size="medium">{orgResult.address}</Title>
            <Title size="medium">
              {orgResult.zipCode} {orgResult.city}
            </Title>
          </View>
          <Divider />
        </View>
      )}
      {orgResult && (
        <Body size="medium" color="secondary">
          Stämmer företagsuppgifterna, klicka fortsätt
        </Body>
      )}
      <Button
        label="Fortsätt"
        onPress={handleSubmit}
        loading={loading}
        disabled={!orgResult || orgResult.alreadyRegistered || !isEmailValid}
      />
    </View>
  );
}
