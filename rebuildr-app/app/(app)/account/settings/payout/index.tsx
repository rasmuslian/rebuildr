import { AccountSettingsPayoutQueryQuery, UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PayoutMethodIcon } from "@components/payout/payout-methods/payout-method-icon";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Title } from "@components/typography/text";
import { payoutAccountToMethod } from "@constants/payouts";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

const ACCOUNT_SETTINGS_PAYOUT_QUERY = gql`
  query AccountSettingsPayoutQuery {
    me {
      id
      type
      payoutAccount {
        provider
        accountName
        bankName
        phoneNumber
      }
    }
  }
`;

export default function Payout() {
  const colors = useThemeColor();
  const { data, refetch } = useQuery<AccountSettingsPayoutQueryQuery>(
    ACCOUNT_SETTINGS_PAYOUT_QUERY,
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  const payoutAccount = data.me.payoutAccount;
  if (!payoutAccount) {
    if (data.me.type === UserType.Business) {
      return <Redirect href="/account/settings/payout/payout-method" />;
    }
    return <Redirect href="/account/settings/payout/verify" />;
  }

  return (
    <ScreenLayout style={{ gap: 24 }}>
      <Display size="small">Du får dina utbetalningar till:</Display>
      <View
        style={{
          borderColor: colors.buttons.outlinedStroke.disabled,
          borderRadius: borderRadius.medium,
          borderWidth: 1,
          padding: 16,
          gap: 16,
        }}
      >
        <View style={{ gap: 16, flexDirection: "row", alignItems: "center" }}>
          <PayoutMethodIcon
            method={payoutAccountToMethod[payoutAccount.provider]}
          />
          <View style={{ gap: 4 }}>
            <Title size="medium">
              {payoutAccountToMethod[payoutAccount.provider]}
            </Title>
            {payoutAccount.phoneNumber && (
              <Body size="medium" color="secondary">
                {payoutAccount.phoneNumber}
              </Body>
            )}
            {payoutAccount.accountName && (
              <Body size="medium" color="secondary">
                {payoutAccount.accountName}
              </Body>
            )}
            {payoutAccount.bankName && (
              <Body size="medium" color="secondary">
                {payoutAccount.bankName}
              </Body>
            )}
          </View>
        </View>
        <Divider />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Body size="medium" color="secondary">
            Vill du ändra till ett annat utbetalningskonto?
          </Body>
          <Button
            label="Ändra"
            type="tonal"
            onPress={() => {
              if (data.me.type === UserType.Business) {
                router.navigate("/(app)/account/settings/payout/payout-method");
                return;
              }
              router.navigate("/(app)/account/settings/payout/change-method");
            }}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
