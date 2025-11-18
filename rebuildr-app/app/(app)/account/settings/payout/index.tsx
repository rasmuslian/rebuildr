import { AccountSettingsPayoutQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PayoutMethodIcon } from "@components/payout/payout-methods/payout-method-icon";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Bankkonto from "@assets/svgs/bankkonto.svg";
import { Image } from "expo-image";
import { useScreenType } from "@hooks/useScreenType";
import { TransparentModal } from "@components/transparent-modal.tsx/transparent-modal";
import { Header } from "@components/navigation/headers/header";

const ACCOUNT_SETTINGS_PAYOUT_QUERY = gql`
  query AccountSettingsPayoutQuery {
    me {
      id
      type
      payoutAccount {
        type
        routingNumber
        bankName
        last4
      }
    }
  }
`;

export default function Payout() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { data, refetch } = useQuery<AccountSettingsPayoutQueryQuery>(
    ACCOUNT_SETTINGS_PAYOUT_QUERY,
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (!data) {
    if (isDesktop) {
      return (
        <TransparentModal>
          <LoadingSpinner />
        </TransparentModal>
      );
    }
    return <LoadingSpinner />;
  }

  const renderNoPayoutAccount = () => {
    return (
      <View style={{ justifyContent: "space-between", flex: 1, gap: 24 }}>
        <View style={{ gap: 24 }}>
          <View
            style={{
              paddingVertical: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", paddingVertical: 24 }}>
              <Image
                source={Bankkonto.uri}
                style={{ width: 187, height: 187 }}
              />
            </View>
          </View>
        </View>
        <Display size="small" style={{ textAlign: "center" }}>
          Koppla ett utbetalningskonto
        </Display>
        <Body size="medium" style={{ textAlign: "center" }}>
          Du har inget utbetalningskonto kopplat. För att få betalt, lägg till
          ett utbetalningskonto.
        </Body>
      </View>
    );
  };

  const content = (
    <>
      {data.me.payoutAccount ? (
        <>
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
            <View
              style={{ gap: 16, flexDirection: "row", alignItems: "center" }}
            >
              <PayoutMethodIcon />
              <View style={{ gap: 4 }}>
                <Title size="medium">Bankkonto</Title>
                {data.me.payoutAccount && (
                  <Body size="medium" color="secondary">
                    {data.me.payoutAccount.routingNumber}•••
                    {data.me.payoutAccount.last4}
                  </Body>
                )}
                {data.me.payoutAccount?.bankName && (
                  <Body size="medium" color="secondary">
                    {data.me.payoutAccount?.bankName}
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
                  router.navigate("/account/settings/payout/add");
                }}
              />
            </View>
          </View>
        </>
      ) : (
        renderNoPayoutAccount()
      )}
    </>
  );

  if (isDesktop) {
    return (
      <TransparentModal>
        <ScreenLayout
          style={{ gap: 24 }}
          contentHorizontalPadding={0}
          headerComponent={<Header title="Utbetalningskonto" />}
          footerComponent={
            <Button
              label="Lägg till utbetalningskonto"
              onPress={() => {
                router.navigate("/account/settings/payout/add");
              }}
            />
          }
        >
          {content}
        </ScreenLayout>
      </TransparentModal>
    );
  }

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      headerComponent={<Header title="Utbetalningskonto" />}
      footerComponent={
        <Button
          label="Lägg till utbetalningskonto"
          onPress={() => {
            router.navigate("/account/settings/payout/add");
          }}
        />
      }
    >
      {content}
    </ScreenLayout>
  );
}
