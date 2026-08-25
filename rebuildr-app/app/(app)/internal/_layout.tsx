import { InternalAdsMenuContextQuery } from "@/gql/graphql";
import { INTERNAL_ADS_MENU_CONTEXT } from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline } from "@components/typography/text";
import { useRouter, Slot } from "expo-router";
import { View } from "react-native";

import RebuildrHead from "@components/meta-data/rebuildr-head";

export default function InternalLayout() {
  const router = useRouter();
  const { data, loading } = useQuery<InternalAdsMenuContextQuery>(
    INTERNAL_ADS_MENU_CONTEXT,
    { fetchPolicy: "cache-and-network" },
  );
  if (loading) return <LoadingSpinner />;
  if (!data?.internalAdsOrganizationContext) {
    return (
      <ScreenLayout headerComponent={<InternalTopBar />} headerFullWidth>
        <View style={{ gap: 12, paddingTop: 48 }}>
          <Headline size="large">Du saknar tillgång till Återbanken</Headline>
          <Body size="large" color="secondary">Logga in med företagskontot för att använda Återbanken.</Body>
        </View>
      </ScreenLayout>
    );
  }
  return <><RebuildrHead title="Återbanken" /><Slot /></>;
}
