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
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Popup } from "@components/popup/popup";
import React, { useState } from "react";
import MapThumbnail from "@components/maps/map-thumbnail";
import { Divider } from "@components/dividers/divider";

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

  const { filterBuilder } = useFilterProduct();
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
      <Display size="small">Hubbar</Display>
      <Body size="medium">
        Här samlas både RebuildRs egna hubbar och företagsdrivna hubbar – alla
        kopplade till produkter för återbruk
      </Body>
      {data?.users.users.map((u, i) => (
        <React.Fragment key={i}>
          <AccordionSection
            title={u.username ?? ""}
            key={i}
            initialOpen={i === 0}
          >
            <Image
              source={u.profilePicture?.url ?? PlaceHolder}
              style={{
                width: 236,
                height: 80,
                marginVertical: 36,
                alignSelf: "center",
              }}
              contentFit="contain"
            />
            <Body size="medium">{u.description}</Body>
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
            {u.projects.map((p, i) => (
              <Pressable
                onPress={() => {
                  if (isDesktop) {
                    setShowProject(p);
                  } else {
                    filterBuilder.reset().setProjectId(p.id).apply();
                    router.navigate("/map");
                  }
                }}
                key={i}
              >
                <View
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <Image
                    source={u.isFeatured ? FeaturedHubIcon.uri : HubIcon.uri}
                    style={{ height: 32, width: 32 }}
                  />
                  <Label size="large">Visa {p.title} på kartan</Label>
                </View>
              </Pressable>
            ))}
          </AccordionSection>
          {i < data.users.users.length - 1 && <Divider />}
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
    );
  }

  return (
    <ScreenLayout
      headerComponent={
        <Header title="Hem" onBack={() => router.replace("/")} />
      }
    >
      {content}
    </ScreenLayout>
  );
}
