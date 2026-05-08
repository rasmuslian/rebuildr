import { useScreenType } from "@hooks/useScreenType";
import React, { useEffect, useState } from "react";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { View } from "react-native";
import { Body, Title } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { router } from "expo-router";
import { useCookies } from "@hooks/use-cookies";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";

export const CookieConsent = () => {
  const { isReady, hasAnswered, acceptCookies, declineCookies } = useCookies();
  const [show, setShow] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);

  const { isDesktop } = useScreenType();

  useEffect(() => {
    if (!isReady) return;
    setShow(!hasAnswered);
  }, [hasAnswered, isReady]);

  const onAcceptAll = () => {
    if (isLoading) return;

    setAcceptLoading(true);
    acceptCookies().then(() => {
      setShow(false);
      setAcceptLoading(false);
    });
  };

  const onManageCookies = () => {
    setShow(false);
    router.navigate("/cookies");
  };
  const onReject = () => {
    if (isLoading) return;

    setDeclineLoading(true);
    declineCookies().then(() => {
      setShow(false);
      setDeclineLoading(false);
    });
  };

  const isLoading = acceptLoading || declineLoading;

  if (!isReady) {
    return null;
  }

  const content = (
    <View>
      <Title size="large" style={{ marginBottom: 12 }}>
        Vi använder cookies
      </Title>
      <Body size="large">
        Vi använder cookies RebuildR använder cookies för att förbättra din
        upplevelse, analysera trafik och visa relevant innehåll. Du väljer själv
        vad du tillåter.{" "}
      </Body>

      <View style={{ gap: 12, marginTop: 32 }}>
        <Button
          label="Acceptera alla"
          onPress={onAcceptAll}
          loading={acceptLoading}
        />
        <Button
          label="Hantera cookies"
          onPress={onManageCookies}
          type="outlined"
        />
        <Button
          label="Avvisa alla"
          onPress={onReject}
          type="outlined"
          loading={declineLoading}
        />
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onReject}>
        <View
          style={{
            padding: 24,
            paddingTop: 16,
            justifyContent: "center",
          }}
        >
          <Header
            title="Cookies"
            showBackButton={false}
            showDivider
            ctas={[
              {
                icon: "X",
                onPress: onReject,
              },
            ]}
          />
          <View style={{ padding: 48 }}>{content}</View>
        </View>
      </Popup>
    );
  }
  return (
    <BottomSheet
      name="Cookies"
      open={show}
      onDismiss={onReject}
      containerStyle={{ marginTop: 24 }}
    >
      {content}
    </BottomSheet>
  );
};
