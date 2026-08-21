import { InternalAdsMenuContextQuery } from "@/gql/graphql";
import { INTERNAL_ADS_MENU_CONTEXT } from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { router, Slot, useSegments } from "expo-router";
import { View } from "react-native";

import RebuildrHead from "@components/meta-data/rebuildr-head";

export default function InternalLayout() {
  const segments = useSegments();
  const { data, loading } = useQuery<InternalAdsMenuContextQuery>(
    INTERNAL_ADS_MENU_CONTEXT,
    { fetchPolicy: "cache-and-network" },
  );
  const isMemberManagement = segments.includes("members");
  const isInvite = segments.includes("invite");
  const isOrganizationAccount =
    data?.internalAdsOrganizationContext?.isOrganizationAccount;

  return (
    <>
      <RebuildrHead title="Återbanken" />
      {loading ? (
        <LoadingSpinner />
      ) : isOrganizationAccount && !isMemberManagement && !isInvite ? (
        <ScreenLayout
          headerComponent={<InternalTopBar />}
          headerFullWidth
          style={{ alignItems: "center", paddingTop: 48 }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 640,
              gap: 24,
              padding: 32,
              backgroundColor: primitives.accent100,
              borderColor: primitives.accent200,
              borderWidth: 1,
              borderRadius: borderRadius.medium,
            }}
          >
            <View style={{ gap: 8 }}>
              <Label size="medium" color="secondary">
                Återbanken
              </Label>
              <Headline size="large" heading={1}>
                Logga in som organisationsmedlem
              </Headline>
              <Body size="large" color="secondary">
                För att se, skapa och reservera annonser behöver du använda ditt
                personliga medlemskonto. Då kan organisationen se vem som har
                lagt upp eller reserverat en annons.
              </Body>
            </View>

            <View
              style={{
                gap: 8,
                padding: 16,
                backgroundColor: primitives.neutrals100,
                borderRadius: borderRadius.small,
              }}
            >
              <Label size="large">Inloggad med företagskontot?</Label>
              <Body size="medium" color="secondary">
                Här kan du fortfarande bjuda in och hantera organisationens
                medlemmar.
              </Body>
            </View>

            <Button
              label="Hantera organisationsmedlemmar"
              icon="arrowRight"
              iconPosition="right"
              onPress={() => router.push("/internal/members")}
              style={{ alignSelf: "flex-start" }}
            />
          </View>
        </ScreenLayout>
      ) : (
        <Slot />
      )}
    </>
  );
}
