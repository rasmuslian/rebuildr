import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Label, Title } from "@components/typography/text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import IntegrityImage from "@assets/svgs/integrity.svg";
import { Image } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Button } from "@components/buttons/button";
import { router } from "expo-router";
import { useCookies } from "@hooks/use-cookies";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";

export default function Cookies() {
  const [analytical, setAnalytical] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [acceptAllLoading, setAcceptAllLoading] = useState(false);
  const colors = useThemeColor();
  const { consentStatus, acceptCookies, declineCookies } = useCookies();
  const { isDesktop } = useScreenType();

  useEffect(() => {
    if (!consentStatus) {
      return;
    }

    if (consentStatus === "granted") {
      setAnalytical(true);
    }
    if (consentStatus === "denied") {
      setAnalytical(false);
    }
  }, [consentStatus]);

  const onSave = () => {
    if (isLoading) return;

    setSaveLoading(true);
    if (analytical) {
      acceptCookies().then(() => {
        setSaveLoading(false);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.navigate("/");
        }
      });
    }
    if (!analytical) {
      declineCookies().then(() => {
        setSaveLoading(false);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.navigate("/");
        }
      });
    }
  };

  const acceptAll = () => {
    if (isLoading) return;

    setAcceptAllLoading(true);
    acceptCookies().then(() => {
      setAcceptAllLoading(false);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/");
      }
    });
  };

  const content = (
    <>
      <Title size="large" style={{ marginBottom: 10 }}>
        Dina cookieinställningar
      </Title>
      <Body size="large">
        Välj vilka cookies du tillåter. Du kan ändra inställningarna när som
        helst.
      </Body>
      <View style={{ gap: 16, marginTop: 26 }}>
        <ToggleCard
          enabled //This is always true, since user can not opt out of these cookies
          title="Nödvändiga"
          description="Alltid aktiva"
          onPress={() => {
            /**Can't be disabled */
          }}
        />
        <ToggleCard
          enabled={analytical}
          title="Analytiska"
          description="Förbättra upplevelsen"
          onPress={() => {
            setAnalytical(!analytical);
          }}
        />
        <View
          style={{
            gap: 8,
            backgroundColor: colors.background.secondary,
            borderRadius: borderRadius.medium,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Label size="medium">Vi säljer aldrig dina uppgifter</Label>
              <Label size="medium">Integritetspolicy</Label>
            </View>
            <Image
              source={IntegrityImage.uri}
              style={{ width: 34, height: 38 }}
            />
          </View>
          <Body
            size="small"
            link={{
              pathname: "/article/[slug]",
              params: { slug: "integritetspolicy" },
            }}
          >
            Läs vår Integritetspolicy
          </Body>
        </View>
      </View>
    </>
  );

  const footer = (
    <View style={{ gap: 12 }}>
      <Button
        label="Spara mina inställningar"
        onPress={onSave}
        loading={saveLoading}
      />
      <Button
        label="Acceptera alla"
        onPress={acceptAll}
        type="outlined"
        loading={acceptAllLoading}
      />
    </View>
  );

  const isLoading = saveLoading || acceptAllLoading;

  if (isDesktop) {
    return (
      <ScreenLayout headerComponent={<TopBar theme="light" />}>
        <View style={{ width: 720, alignSelf: "center" }}>
          {content}
          <View style={{ marginTop: 32 }}>{footer}</View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      headerComponent={<Header title="Vi använder cookies" />}
      footerComponent={footer}
    >
      {content}
    </ScreenLayout>
  );
}
