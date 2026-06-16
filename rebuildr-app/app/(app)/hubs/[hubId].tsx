import { HubQuery, HubQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import InteractiveMap from "@components/maps/interactive-map";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { borderRadius } from "@constants/sizes";
import { useLocalSearchParams } from "expo-router";
import RebuildrHead from "@components/meta-data/rebuildr-head";

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
    <>
      <RebuildrHead
        title={data.getProject.title ?? "Hub"}
        description={`Försäljningsplats för återbrukat byggmaterial: ${data.getProject.title ?? "hub"} på RebuildR.`}
      />
      <ScreenLayout
        headerComponent={
          <Header title={data.getProject.title ?? "Hub"} headingLevel={1} />
        }
      >
        <InteractiveMap
          initialCenter={data?.getProject.approximatePlace}
          productsInput={{ projectId: hubId }}
          projectsInput={{ ids: [hubId] }}
          style={{ height: "100%", borderRadius: borderRadius.small }}
        />
      </ScreenLayout>
    </>
  );
}
