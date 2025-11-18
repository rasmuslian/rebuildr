import { Button } from "@components/buttons/button";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";
import { Image } from "expo-image";
import { Body, Display } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { IbanElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { borderRadius } from "@constants/sizes";
import { gql, useMutation, useQuery } from "@apollo/client";
import Bankkonto from "@assets/svgs/bankkonto.svg";
import { useThemeColor } from "@hooks/useThemeColor";
import { FormFieldWrapper } from "@components/forms/formFieldWrapper";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useEffect, useState } from "react";
import {
  AddBankPayoutAccountMeQuery,
  AddBankPayoutAccountMutation,
  AddBankPayoutAccountMutationVariables,
} from "@/gql/graphql";
import { router } from "expo-router";
import { useScreenType } from "@hooks/useScreenType";
import { Header } from "@components/navigation/headers/header";
import { AccountState } from "@components/account/account-wrapper.desktop";

const ADD_BANK_PAYOUT_ACCOUNT_ME = gql`
  query AddBankPayoutAccountMe {
    me {
      id
      name
    }
  }
`;

const ADD_BANK_PAYOUT_ACCOUNT = gql`
  mutation AddBankPayoutAccount($input: String!) {
    addPayoutAccount(token: $input) {
      id
    }
  }
`;

type Props = {
  onNavigation?: (state: AccountState) => void;
  onBack?: () => void;
};

export default function Add({ onNavigation, onBack }: Props) {
  const [ownerName, setOwnerName] = useState("");
  const { isDesktop } = useScreenType();
  const [addingPayoutAccount, setAddingPayoutAccount] = useState(false);
  const [error, setError] = useState(false);
  const { data } = useQuery<AddBankPayoutAccountMeQuery>(
    ADD_BANK_PAYOUT_ACCOUNT_ME,
  );
  const [addPayoutAccount] = useMutation<
    AddBankPayoutAccountMutation,
    AddBankPayoutAccountMutationVariables
  >(ADD_BANK_PAYOUT_ACCOUNT);
  const stripe = useStripe();
  const elements = useElements();

  const onAddBankPayoutAccount = async () => {
    if (!stripe || !elements) {
      console.log("No stripe or elements");
      return;
    }
    const iban = elements.getElement(IbanElement);
    if (!iban) {
      console.log("No iban");
      return;
    }
    setAddingPayoutAccount(true);
    setError(false);
    const { token, error } = await stripe.createToken(iban, {
      currency: "sek",
      account_holder_name: ownerName,
      account_holder_type: "individual", //Change if business
    });
    if (error) {
      console.log("error :>> ", error);
      setError(true);
      setAddingPayoutAccount(false);
      return;
    }
    await addPayoutAccount({
      variables: { input: token.id },
    });
    setAddingPayoutAccount(false);
    if (onNavigation) {
      onNavigation({ page: "payout-index" });
    } else {
      router.replace("/account/settings/payout");
    }
  };

  useEffect(() => {
    if (data) {
      setOwnerName(data.me.name ?? "");
    }
  }, [data]);

  return (
    <ScreenLayout
      style={{ flex: 1, gap: 24 }}
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={<Header title="Utbetalningskonto" onBack={onBack} />}
      footerComponent={
        <View style={{ gap: 4 }}>
          {error && (
            <Body size="small" color="error">
              Något gick fel
            </Body>
          )}
          <Button
            label="Koppla Bankkonto"
            disabled={!stripe || !ownerName}
            onPress={() => onAddBankPayoutAccount()}
            loading={addingPayoutAccount}
          />
        </View>
      }
    >
      <View
        style={{
          marginVertical: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image source={Bankkonto.uri} style={{ width: 187, height: 187 }} />
      </View>

      <Display size="small" style={{ textAlign: "center" }}>
        Koppla ditt Bankkonto för enkla utbetalningar
      </Display>
      <Body style={{ textAlign: "center" }} size="medium">
        Få dina utbetalningar direkt till ditt Bankkonto. Ange ditt IBAN-nummer
        nedan för att koppla ditt bankkonto.
      </Body>
      <Divider />
      {data && (
        <View style={{ gap: 24 }}>
          <FormFieldWrapper heading="Kontinnehavarens namn">
            <TextInput value={ownerName} onChange={setOwnerName} />
          </FormFieldWrapper>
          <FormFieldWrapper heading="Kontonummer (IBAN)">
            <BankComponent />
          </FormFieldWrapper>
        </View>
      )}
      {!data && <LoadingSpinner />}
    </ScreenLayout>
  );
}

const BankComponent = () => {
  const colors = useThemeColor();

  return (
    <View
      style={{
        borderWidth: 1,
        padding: 10,
        borderRadius: borderRadius.medium,
        borderColor: colors.textField.enabled,
      }}
    >
      <IbanElement
        options={{
          supportedCountries: ["SEPA"],
          placeholderCountry: "SE",
          style: {
            base: {
              fontSize: "16px",
              color: colors.text.primaryDark,
              "::placeholder": { color: colors.text.disabled },
              fontFamily: "Inter-Regular",
              iconColor: colors.text.primaryDark,
            },
            complete: {
              iconColor: colors.text.primaryDark,
            },
            invalid: {
              color: colors.text.error,
              iconColor: colors.text.error,
            },
          },
        }}
      />
    </View>
  );
};
