import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { AccordionSection } from "@components/sections/accordion-section";
import { Body, Display, Headline, Label } from "@components/typography/text";
import { Href, Link, router } from "expo-router";
import PlaceHolder from "@assets/images/placeholder-profile-business.png";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import HubIcon from "@assets/svgs/hub-icon.svg";
import FeaturedHubIcon from "@assets/svgs/hub-featured-icon.svg";
import { Icon } from "@icons/icon";
import { gql, useQuery } from "@apollo/client";
import {
  HubsQuery,
  HubsQueryVariables,
  MapPinTypeEnum,
  OrderUsersEnum,
  UserType,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Popup } from "@components/popup/popup";
import React, { useState } from "react";
import MapThumbnail from "@components/maps/map-thumbnail";
import { Divider } from "@components/dividers/divider";
import RebuildrHead from "@components/meta-data/rebuildr-head";

const HUBS = gql`
  query Hubs($input: UsersInput!) {
    users(input: $input) {
      users {
        id
        username
        description
        websiteUrl
        isFeatured
        profilePicture {
          id
          url
        }
        projects {
          id
          title
          approximatePlace {
            lat
            lng
            address
          }
        }
      }
      total
    }
  }
`;

export default function Hubs() {
  const [showProject, setShowProject] =
    useState<HubsQuery["users"]["users"][0]["projects"][0]>();

  const { isDesktop } = useScreenType();

  const { data } = useQuery<HubsQuery, HubsQueryVariables>(HUBS, {
    variables: {
      input: {
        hasProject: true,
        type: UserType.Business,
        orderBy: OrderUsersEnum.Alphabetical,
      },
    },
  });

  const content = (
    <View style={{ gap: 24 }}>
      <Display size="small" heading={1}>
        Företagsförsäljning
      </Display>
      <Body size="medium">
        RebuildR gör det möjligt för företag och organisationer att sälja
        återbrukat material direkt till privatpersoner. Vi skapar en praktisk
        väg från överskott till försäljning.
      </Body>
      {data?.users.users.map((u, i) => (
        <View key={i} style={{ gap: 24 }}>
          <AccordionSection
            title={u.username ?? ""}
            key={i}
            initialOpen={i === 0}
          >
            <View
              style={{
                height: 152,
                width: "100%",
                maxWidth: 236,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Image
                source={u.profilePicture?.url ?? PlaceHolder}
                alt={`${u.username ?? "Företag"} – säljer återbruk på RebuildR`}
                style={{
                  height: "100%",
                  width: "100%",
                }}
                contentFit="contain"
              />
            </View>
            {u.description && <Body size="medium">{u.description}</Body>}
            {u.websiteUrl && (
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
                <Link href={u.websiteUrl as Href} target="_blank">
                  <Label size="large">Länk till hemsida</Label>
                </Link>
              </View>
            )}
            <Label size="medium">Försäljningsplats, klicka för mer info:</Label>
            {u.projects.map((p, j) => (
              <Pressable
                onPress={() => {
                  if (isDesktop) {
                    setShowProject(p);
                  } else {
                    router.navigate({
                      pathname: "/hubs/[hubId]",
                      params: { hubId: p.id },
                    });
                  }
                }}
                key={j}
              >
                <View
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <Image
                    source={u.isFeatured ? FeaturedHubIcon.uri : HubIcon.uri}
                    style={{ height: 32, width: 32 }}
                  />
                  <Label size="large">{p.title}</Label>
                </View>
              </Pressable>
            ))}
          </AccordionSection>
          {i < data.users.users.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  );

  const head = (
    <RebuildrHead
      title="Företagsförsäljning – hubbar"
      description="Företag och organisationer säljer återbrukat byggmaterial direkt till privatpersoner via RebuildRs hubbar. Hitta försäljningsplatser nära dig."
    />
  );

  if (isDesktop) {
    return (
      <>
        {head}
        <ScreenLayout
          headerComponent={<TopBar theme="light" />}
          style={{ width: 720, alignSelf: "center" }}
        >
          {content}
          <Popup
            open={!!showProject}
            onClose={() => setShowProject(undefined)}
            type="full"
          >
            {showProject && (
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={{ padding: 24, width: "70%" }}>
                  <Headline size="small" style={{ marginBottom: 16 }}>
                    {showProject.title}
                  </Headline>
                  <Body
                    size="medium"
                    color="primaryDark"
                    style={{ marginBottom: 16 }}
                  >
                    {showProject.approximatePlace.address}
                  </Body>
                  <Body
                    size="small"
                    color="secondary"
                    style={{ marginBottom: 24 }}
                  >
                    Ungefärligt område. Adress visas först när ett köp har
                    genomförts.
                  </Body>
                  <MapThumbnail
                    coords={[
                      showProject.approximatePlace.lat,
                      showProject.approximatePlace.lng,
                    ]}
                    markerType={MapPinTypeEnum.Hub}
                    style={{ height: 700 }}
                  />
                </View>
              </View>
            )}
          </Popup>
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      {head}
      <ScreenLayout
        headerComponent={
          <Header title="Hem" onBack={() => router.replace("/")} />
        }
      >
        {content}
      </ScreenLayout>
    </>
  );
}
