import React, { useContext, useState } from "react";
import { View, ImageBackground, ScrollView, Linking } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { Button } from "@components/buttons/button";
import { Logo } from "@components/logo/logo";
import { Label, Title, Display, Body } from "@components/typography/text";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import TopBar from "@components/navigation/top-bar/top-bar";
import Svg, { Path as SvgPath } from "react-native-svg";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  ComingSoonSignUpMutation,
  ComingSoonSignUpMutationVariables,
} from "@/gql/graphql";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { textStyles } from "@components/typography/typeface";
import { router } from "expo-router";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import CompetitionSponsor from "@assets/images/competition-sponsor.png";
import BottomsheetPopupHero from "@assets/images/bottomsheet-popup-hero.png";
import { Divider } from "@components/dividers/divider";
import { formatPrice } from "@/utils/formattings";
import { Form } from "@components/forms/form";
import { useUser } from "@hooks/useUser";
import { LoginModalContext } from "@context/loginModalContext";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import RebuildrHead from "@components/meta-data/rebuildr-head";

const NEWSLETTER_COMPETITION = gql`
  query NewsletterCompetition {
    newsletterCompetition {
      title
      productTitle
      productValue
      bodyText
      nextDrawDate
      productImage {
        url
      }
    }
  }
`;

const NEWSLETTER_SIGNUP = gql`
  mutation ComingSoonSignUp($input: SignupNewsLetterInput!) {
    signupNewsLetter(input: $input)
  }
`;

export default function CompetitionPage() {
  const colors = useThemeColor();
  const { data: competitionData } = useQuery(NEWSLETTER_COMPETITION);
  const competition = competitionData?.newsletterCompetition;
  const { isDesktop } = useScreenType();

  const head = (
    <RebuildrHead
      title="Nyhetsbrev & tävling"
      description="Prenumerera på RebuildRs nyhetsbrev och var med i veckans utlottning av verktyg. Återbruk, tips och nyheter om återbrukat byggmaterial."
    />
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const [signup, { loading, error }] = useMutation<
    ComingSoonSignUpMutation,
    ComingSoonSignUpMutationVariables
  >(NEWSLETTER_SIGNUP);

  const handleSubmit = async () => {
    if (!email) return;
    const result = await signup({
      variables: {
        input: {
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
      },
    });
    if (result.data?.signupNewsLetter) {
      setSubmitted(true);
      setShowSheet(true);
    }
  };

  const headerContent = (
    <View
      style={[
        { gap: 8, marginTop: 8 },
        !isDesktop && {
          marginHorizontal: 12,
        },
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          },
        ]}
      >
        <Button
          icon={{ icon: "arrowLeft", color: "primaryLight" }}
          onPress={() => router.navigate("/")}
          type="text"
          style={[!isDesktop && { marginLeft: -12 }]}
        />

        <Title size="medium" style={{ marginVertical: 8 }} color="primaryLight">
          Startsidan
        </Title>
      </View>
      <Divider />
    </View>
  );

  const heroCurveOverlay = (
    <View
      pointerEvents="none"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
    >
      <Svg
        width="100%"
        height={29}
        viewBox="0 0 375 29"
        preserveAspectRatio="none"
      >
        <SvgPath
          d="M0 0 C0 0 92 29 187.5 29 C283 29 375 0 375 0 L375 29 L0 29 Z"
          fill={colors.background.neutral}
        />
      </Svg>
    </View>
  );

  const bodyContent = (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 24,
        gap: 24,
      }}
    >
      {/* Description */}
      {competition?.bodyText ? (
        <Markdown
          style={{
            body: {
              ...textStyles.title["medium"],
              color: primitives.neutrals600,
            },
            link: {
              color: primitives.accent500,
            },
          }}
          onLinkPress={(url) => {
            Linking.openURL(url);
            return false;
          }}
        >
          {competition.bodyText}
        </Markdown>
      ) : null}

      {/* Next draw card */}
      <View
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.medium,
          padding: 16,
          gap: 4,
        }}
      >
        <Label size="small" color="secondary">
          Nästa dragning sker:
        </Label>
        <Title size="medium">
          {competition?.nextDrawDate
            ? new Date(competition.nextDrawDate).toLocaleDateString("sv-SE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </Title>
      </View>

      {/* Footer note */}
      <Title size="medium" color="secondary">
        Vinnare presenteras löpande både i våra nyhetsbrev och på Instagram -
        villkor gäller*
      </Title>

      {/* Sign-up form */}
      {submitted ? (
        <View
          style={{
            backgroundColor: primitives.primary800,
            borderRadius: borderRadius.medium,
            padding: 24,
            alignItems: "center",
            gap: 12,
          }}
        >
          <Title size="large" style={{ color: primitives.neutrals100 }}>
            Tack!
          </Title>
          <Body
            size="medium"
            style={{ color: primitives.neutrals100, textAlign: "center" }}
          >
            Du är nu med i utlottningen. Vi hör av oss via nyhetsbrevet varje
            vecka.
          </Body>
        </View>
      ) : (
        <View style={{ gap: 32 }}>
          <Form
            style={{ gap: 16 }}
            fields={[
              {
                type: "text",
                heading: "Förnamn",
                value: firstName,
                onChange: setFirstName,
                placeholder: "Jane",
              },
              {
                type: "text",
                heading: "Efternamn",
                value: lastName,
                onChange: setLastName,
                placeholder: "Doey",
              },
              {
                type: "text",
                heading: "E-postadress",
                error: error?.message,
                value: email,
                onChange: setEmail,
                placeholder: "jane@doey.com",
                keyboardType: "email-address",
                autoCapitalize: "none",
              },
            ]}
          />
          <Button
            label="Prenumerera"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email || loading}
          />
        </View>
      )}

      {/* Partner section */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: primitives.neutrals300,
          marginTop: 40,
          paddingTop: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Title size="small" color="secondary" style={{ flex: 1 }}>
          Tävlingen sker i samarbete med Maskin & Verktyg
        </Title>
        <Image
          source={CompetitionSponsor}
          style={{ width: 78, height: 57, opacity: 0.67 }}
          contentFit="contain"
        />
      </View>

      {/* Terms & conditions */}
      <View
        style={{
          borderWidth: 1,
          borderColor: primitives.neutrals300,
          borderRadius: borderRadius.medium,
          padding: 16,
          marginBottom: 32,
          gap: 8,
        }}
      >
        <Body size="medium" color="secondary">
          *Villkor - För att vara med och tävla och vinna i utlottningen behöver
          du vara aktiv prenumerant på RebuildRs nyhetsbrev vid tidpunkten för
          dragningen. Följer du oss även på instagram ökar chanserna att vinna
          då vi drar vinnare enligt följande:
        </Body>
        <View style={{ gap: 12, paddingTop: 4 }}>
          <Body size="medium" color="secondary">
            • Prenumerant nyhetsbrev = 1 st vinstchans
          </Body>
          <Body size="medium" color="secondary">
            • Följer på Instagram = 1 st vinstchans
          </Body>
          <Body size="medium" color="secondary">
            • Aktivt användarkonto på RebuildR = 1 st vinstchans
          </Body>
        </View>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <>
        {head}
        <ScreenLayout
          headerComponent={<TopBar theme="light" />}
          desktopFooter
          contentHorizontalPadding={0}
          style={{ width: 700, alignSelf: "center" }}
        >
          {/* Hero */}
          <ImageBackground
            source={require("@assets/images/main-background.png")}
            resizeMode="cover"
            style={[
              {
                backgroundColor: colors.logo.vector,
                width: "100%",
                overflow: "hidden",
                minHeight: 320,
              },
              {
                clipPath:
                  "polygon(0 0, 100% 0, 100% 92%, 87.5% 94%, 75% 97%, 62.5% 99%, 50% 100%, 37.5% 99%, 25% 97%, 12.5% 94%, 0 92%)",
              } as any,
            ]}
          >
            {headerContent}
            <View
              style={{
                alignItems: "center",
                paddingTop: 40,
                paddingBottom: 48,
                paddingHorizontal: 24,
                gap: 32,
              }}
            >
              <Logo
                width={160}
                height={32}
                theme="dark"
                customColor={primitives.neutrals100}
              />
              <Display
                size="small"
                color="primaryLight"
                style={{ textAlign: "center" }}
                heading={1}
              >
                {competition?.title ??
                  "Vinn verktyg\nför 10 000 kr\nvarje vecka."}
              </Display>
            </View>
          </ImageBackground>

          {/* Product card */}
          <View style={{ alignItems: "center", marginTop: -40 }}>
            <View
              style={{
                width: 540,
                borderRadius: borderRadius.medium,
                overflow: "hidden",
                backgroundColor: primitives.neutrals100,
              }}
            >
              <Image
                source={competition?.productImage?.url ?? PlaceholderProduct}
                style={{ width: "100%", height: 360 }}
                contentFit="cover"
              />
              <View
                style={{
                  backgroundColor: primitives.primary800,
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Title
                  size="large"
                  color="primaryLight"
                  style={{ textAlign: "center" }}
                >
                  {competition?.productTitle ?? "DeWalt verktygspaket"}
                </Title>
                <Title
                  size="small"
                  color="secondary"
                  style={{ textAlign: "center", color: primitives.primary300 }}
                >
                  Värde:{" "}
                  {competition?.productValue
                    ? formatPrice(competition.productValue)
                    : ""}
                </Title>
              </View>
            </View>
          </View>

          {bodyContent}
        </ScreenLayout>

        <SignupSuccess show={showSheet} onDismiss={() => setShowSheet(false)} />
      </>
    );
  }

  return (
    <>
      {head}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          {
            flex: 1,
            backgroundColor: colors.background.neutral,
          },
        ]}
      >
        {/* Hero */}
        <ImageBackground
          source={require("@assets/images/main-background.png")}
          resizeMode="cover"
          style={{
            backgroundColor: colors.logo.vector,
            width: "100%",
            overflow: "hidden",
            minHeight: 400,
          }}
        >
          {headerContent}
          <View
            style={{
              alignItems: "center",
              paddingTop: 16,
              paddingBottom: 32,
              paddingHorizontal: 16,
              gap: 32,
            }}
          >
            <Logo
              width={120}
              height={24}
              theme="dark"
              customColor={primitives.neutrals100}
            />
            <Display
              size="medium"
              color="primaryLight"
              style={{
                textAlign: "center",
                marginHorizontal: 32,
              }}
              heading={1}
            >
              {competition?.title}
            </Display>
          </View>
          {heroCurveOverlay}
        </ImageBackground>

        {/* Product card */}
        <View style={{ alignItems: "center", marginTop: -82 }}>
          <View
            style={{
              width: 343,
              borderRadius: borderRadius.medium,
              overflow: "hidden",
              backgroundColor: primitives.neutrals100,
            }}
          >
            <Image
              source={competition?.productImage?.url ?? PlaceholderProduct}
              style={{ width: 343, height: 247 }}
              contentFit="cover"
            />
            <View
              style={{
                backgroundColor: primitives.primary800,
                paddingVertical: 18,
                paddingHorizontal: 16,
                alignItems: "center",
                gap: 4,
              }}
            >
              <Title
                size="large"
                color="primaryLight"
                style={{
                  textAlign: "center",
                }}
              >
                {competition?.productTitle ?? "DeWalt verktygspaket"}
              </Title>
              <Title
                size="small"
                color="secondary"
                style={{
                  textAlign: "center",
                  color: primitives.primary300,
                }}
              >
                Värde:{" "}
                {competition?.productValue
                  ? formatPrice(competition.productValue)
                  : ""}
              </Title>
            </View>
          </View>
        </View>

        {bodyContent}
      </ScrollView>

      <SignupSuccess show={showSheet} onDismiss={() => setShowSheet(false)} />
    </>
  );
}

type SignupSuccessProps = {
  show: boolean;
  onDismiss: () => void;
};

const SignupSuccess = ({ show, onDismiss }: SignupSuccessProps) => {
  const { isDesktop } = useScreenType();

  const { isLoggedIn } = useUser();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);

  const content = (
    <View style={{ gap: 24, paddingBottom: 8 }}>
      {/* Hero banner */}
      <View>
        <Image
          source={BottomsheetPopupHero}
          style={{ width: "100%", aspectRatio: 3 / 1 }}
          contentFit="contain"
        />
      </View>

      {/* Text content */}
      <View style={{ paddingHorizontal: 16, gap: 16, alignItems: "center" }}>
        <Title
          size="large"
          style={{
            color: primitives.primary800,
            textAlign: "center",
          }}
        >
          Välkommen till oss!
        </Title>
        <Body size="medium" style={{ textAlign: "center" }}>
          Du är nu registrerad som prenumerant hos oss och är med i tävlingen.
          Köp och sälj något redan idag på RebuildR - hitta något unikt för ditt
          byggprojekt, stort som litet.
        </Body>
        <Body size="medium" style={{ textAlign: "center" }}>
          Registrera ditt användarkonto här och få ytterligare vinstchans i
          dragningen:
        </Body>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 16, alignItems: "center" }}>
        <Button
          label="Skapa konto"
          onPress={() => {
            onDismiss();

            if (!isDesktop) {
              router.replace("/");
            }
            if (!isLoggedIn) {
              setLoginVisible(true);
            } else {
              router.replace("/");
            }
          }}
          style={{ minWidth: 206 }}
        />
      </View>

      {/* Support email */}
      <Body
        size="medium"
        color="secondary"
        style={{ textAlign: "center", paddingHorizontal: 52 }}
      >
        Om du har några frågor, kontakta oss på{" "}
        <Body
          size="medium"
          isLink
          onPress={() => Linking.openURL("mailto:support@rebuildr.org")}
        >
          support@rebuildr.org
        </Body>
      </Body>

      {/* Logo */}
      <View style={{ alignItems: "center" }}>
        <Logo width={120} height={24} theme="dark" />
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <SlideInSheet
        title="Välkommen"
        open={show}
        onClose={onDismiss}
        style={{ flex: 1 }}
      >
        {content}
      </SlideInSheet>
    );
  }

  return (
    <BottomSheet
      open={show}
      title="Välkommen"
      onDismiss={onDismiss}
      name="newsletter-success"
    >
      {content}
    </BottomSheet>
  );
};
