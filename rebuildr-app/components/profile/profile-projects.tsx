import React from "react";
import { View, FlatList } from "react-native";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { ProjectCard } from "@components/cards/project-card";
import { router } from "expo-router";
import { Divider } from "@components/dividers/divider";
import { ProfileQuery } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { SectionHeader } from "@components/sections/section-header";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

type Props = {
  profileQuery: {
    data: ProfileQuery;
    loading: boolean;
  };
};

export default function ProfileProjects({ profileQuery }: Props) {
  const { isDesktop } = useScreenType();

  const projects = profileQuery.data.user.projects.slice(0, 4) ?? [];
  const me = profileQuery.data.me;
  const user = profileQuery.data.user;

  if (profileQuery.loading) return <LoadingSpinner />;
  if (projects.length === 0) return null;

  if (isDesktop) {
    return (
      <View style={{ gap: 24 }}>
        <View style={{ gap: 16 }}>
          <SectionHeader
            buttonTitle="Visa alla"
            onPress={() => {
              router.navigate({
                pathname: "/(app)/project-list/[userId]",
                params: { userId: user.id },
              });
            }}
          >
            Projekt
          </SectionHeader>

          <FlatList
            data={projects}
            columnWrapperStyle={{
              justifyContent: "space-between",
              gap: 24,
            }}
            numColumns={4}
            renderItem={({ item }) => (
              <View style={{ flex: 1 }}>
                {
                  <ProjectCard
                    showHeart={me?.id !== item.user.id}
                    project={item}
                  />
                }
              </View>
            )}
          />
        </View>
        <Divider />
      </View>
    );
  }

  return (
    <View style={{ gap: 24 }}>
      <HoriztalListSection
        data={projects}
        title="Projekt"
        visibleItems={2}
        renderItem={({ item }) => (
          <ProjectCard showHeart={me?.id !== item.user.id} project={item} />
        )}
        onPress={() => {
          router.navigate({
            pathname: "/(app)/project-list/[userId]",
            params: { userId: user.id },
          });
        }}
      />
      <Divider />
    </View>
  );
}
