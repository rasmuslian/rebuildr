import { PayoutMethodQueryQuery, UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Title } from "@components/typography/text";
import {
  PayoutMethodOrganizationType,
  PayoutMethods,
  PayoutMethodsOrganization,
  PayoutMethodType,
} from "@constants/payouts";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Radio } from "@components/controls/radio";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Button } from "@components/buttons/button";
import { PayoutMethodIcon } from "@components/payout/payout-methods/payout-method-icon";

const SELECT_PAYOUT_METHOD_QUERY = gql`
  query PayoutMethodQuery {
    me {
      id
      type
    }
  }
`;

type Props = {
  //Route to the different payout methods. This assumes that the screens are on the same level in the navigation
  methodsBaseRoute: string;
};

export const SelectPayoutMethod = ({ methodsBaseRoute }: Props) => {
  const [chosenMethod, setChosenMethod] = useState<
    PayoutMethodType | PayoutMethodOrganizationType
  >();
  const colors = useThemeColor();

  const { data } = useQuery<PayoutMethodQueryQuery>(SELECT_PAYOUT_METHOD_QUERY);

  if (!data) {
    return <LoadingSpinner />;
  }

  const payoutMethods =
    data.me.type === UserType.Business
      ? PayoutMethodsOrganization
      : PayoutMethods;

  const getShort = (
    method: PayoutMethodType | PayoutMethodOrganizationType,
  ) => {
    switch (method) {
      case "Swish":
        return "Lägg till ditt telefonnummer i nästa steg.";
      case "Trustly":
        return "Direktinsättning till ditt bankkonto via Trustly.";
      case "Bankkonto":
        return "Direktinsättning till ditt bankkonto.";
      case "Bankgiro":
        return "Direktinsättning till ditt bankgirokonto.";
      case "Plusgiro":
        return "Direktinsättning till ditt Plusgirokonto.";
      default:
        return null;
    }
  };
  const onNext = () => {
    switch (chosenMethod) {
      case "Swish":
        router.navigate(`${methodsBaseRoute}/swish` as Href);
        break;
      case "Trustly":
        router.navigate(`${methodsBaseRoute}/trustly` as Href);
        break;
      case "Bankkonto":
        router.navigate(`${methodsBaseRoute}/rix` as Href);
        break;
      case "Bankgiro":
        router.navigate(`${methodsBaseRoute}/bankgiro` as Href);
        break;
      case "Plusgiro":
        router.navigate(`${methodsBaseRoute}/plusgiro` as Href);
        break;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ gap: 24 }}>
        <View>
          <Display size="small">Du är verifierad!</Display>
          <Display size="small">Hur vill du få betalt?</Display>
        </View>
        <Body size="medium">
          {data.me.type === UserType.Personal
            ? "Nu är din identitet bekräftad. Välj om du vill koppla Swish eller ett bankkonto via Trustly för att ta emot utbetalningar."
            : "Nu är din identitet bekräftad. Välj om du vill koppla Bankkonto, Bankgiro eller Plusgiro för att ta emot utbetalningar."}
        </Body>
        <Divider />
        <View style={{ gap: 16 }}>
          <Headline size="small">Välj utbetalningsmetod:</Headline>
          {payoutMethods.map((method) => {
            const isSelected = method === chosenMethod;
            return (
              <Pressable onPress={() => setChosenMethod(method)} key={method}>
                <View
                  style={[
                    {
                      borderRadius: borderRadius.medium,
                      borderWidth: 1,
                      padding: 16,
                      borderColor: isSelected
                        ? colors.textField.clicked
                        : colors.buttons.outlinedStroke.disabled,
                      flexDirection: "row",
                      gap: 16,
                      alignItems: "center",
                    },
                  ]}
                >
                  <PayoutMethodIcon method={method} />
                  <View style={{ flex: 1 }}>
                    <Title size="medium">{method}</Title>
                    <Body size="medium">{getShort(method)}</Body>
                  </View>
                  <Radio
                    selected={isSelected}
                    onPress={() => setChosenMethod(method)}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
        <Button label="Fortsätt" onPress={onNext} />
      </View>
    </View>
  );
};
