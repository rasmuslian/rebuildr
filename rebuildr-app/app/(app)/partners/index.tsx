import { gql, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { AccordionSection } from "@components/sections/accordion-section";
import { Body, Display, Label } from "@components/typography/text";
import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { PartnersQuery } from "@/gql/graphql";
import { Icon } from "@icons/icon";
import { Href, Link, router } from "expo-router";
import { Divider } from "@components/dividers/divider";
import { Header } from "@components/navigation/headers/header";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";

const PARTNERS = gql`
  query Partners {
    partners {
      id
      name
      description
      websiteUrl
      logo {
        id
        url
      }
    }
  }
`;

export default function Partners() {
  const { isDesktop } = useScreenType();
  const { data, loading } = useQuery<PartnersQuery>(PARTNERS);

  const content = (
    <View style={{ gap: 24 }}>
      <Display size="small">Partnersida</Display>
      <Body size="medium">
        Här presenteras RebuildRs partner – verksamheter som valt att arbeta
        aktivt med återbruk. Det gemensamma är viljan att omsätta cirkulära mål
        i faktisk handling och att bidra till ett mer resurseffektiva
        materialflöden.
      </Body>

      <Body size="medium" link="/">
        Läs mer om vårt partnerprogram här.{" "}
      </Body>
      {data?.partners.map((p, i) => (
        <React.Fragment key={i}>
          <AccordionSection title={p.name} initialOpen={i === 0}>
            <Image
              source={p.logo.url}
              style={{
                width: 236,
                height: 80,
                marginVertical: 36,
                alignSelf: "center",
              }}
              contentFit="contain"
            />
            <Body size="medium">{p.description}</Body>
            {p.websiteUrl && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                }}
              >
                <Icon icon="arrowRight" size={18} />
                <Link href={p.websiteUrl as Href} target="_blank">
                  <Label size="large">Länk till hemsida</Label>
                </Link>
              </View>
            )}
          </AccordionSection>
          {i < data.partners.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  );

  if (isDesktop) {
    return (
      <ScreenLayout
        headerComponent={<TopBar theme="light" />}
        style={{ width: 720, alignSelf: "center" }}
      >
        {content}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      loading={loading}
      headerComponent={
        <Header title="Hem" onBack={() => router.replace("/")} />
      }
    >
      {content}
    </ScreenLayout>
  );
}
