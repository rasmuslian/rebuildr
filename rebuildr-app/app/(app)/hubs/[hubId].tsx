import { HubQuery, HubQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import InteractiveMap from "@components/maps/interactive-map";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { borderRadius } from "@constants/sizes";
import { useLocalSearchParams } from "expo-router";

const HUB = gql`
  query Hub($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      approximatePlace {
        lat
        lng
      }
    }
  }
`;

export default function Hub() {
  const { hubId } = useLocalSearchParams<{ hubId: string }>();

  const { data } = useQuery<HubQuery, HubQueryVariables>(HUB, {
    variables: { input: { id: hubId } },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      headerComponent={<Header title={data.getProject.title ?? "Hub"} />}
    >
      <InteractiveMap
        initialCenter={data?.getProject.approximatePlace}
        productsInput={{ projectId: hubId }}
        style={{ height: "100%", borderRadius: borderRadius.small }}
      />
    </ScreenLayout>
  );
}
