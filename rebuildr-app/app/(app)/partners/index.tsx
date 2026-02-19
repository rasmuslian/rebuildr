import { gql, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { AccordionSection } from "@components/sections/accordion-section";
import { Body, Label } from "@components/typography/text";
import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import {
  PageEnum,
  PartnersPageQuery,
  PartnersPageQueryVariables,
} from "@/gql/graphql";
import { Icon } from "@icons/icon";
import { Href, Link, router } from "expo-router";
import { Divider } from "@components/dividers/divider";
import { Header } from "@components/navigation/headers/header";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import ParseHtml from "@components/article/parse-html";

const PARTNERS_PAGE = gql`
  query PartnersPage($page: String!) {
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
    pageContentByPage(page: $page) {
      id
      page
      heroHtml
    }
  }
`;

export default function Partners() {
  const { isDesktop } = useScreenType();
  const { data, loading } = useQuery<
    PartnersPageQuery,
    PartnersPageQueryVariables
  >(PARTNERS_PAGE, {
    variables: {
      page: PageEnum.Partner,
    },
  });

  const content = (
    <>
      <View>
        <ParseHtml html={data?.pageContentByPage.heroHtml} />
      </View>

      <View style={{ gap: 24 }}>
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
    </>
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
