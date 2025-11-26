import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useQuery } from "@apollo/client";
import {
  GetFavoriteProjectsQuery,
  GetFavoriteProjectsQueryVariables,
} from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  PROJECTS_LIST_FRAGMENT,
  ProjectsList,
} from "@components/project/projects-list";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { SectionHeader } from "@components/sections/section-header";
import { View } from "react-native";

const GET_FAVORITE_PROJECTS = gql`
  query GetFavoriteProjects {
    me {
      id
      likedProjects {
        ...ProjectsListFragment
      }
    }
  }
  ${PROJECTS_LIST_FRAGMENT}
`;

export default function FavoriteProjectsPage() {
  const { isDesktop } = useScreenType();
  const { data, loading } = useQuery<
    GetFavoriteProjectsQuery,
    GetFavoriteProjectsQueryVariables
  >(GET_FAVORITE_PROJECTS);

  const projects = data?.me.likedProjects ?? [];

  if (isDesktop) {
    return (
      <ScreenLayout headerComponent={<TopBar theme="light" />}>
        <View style={{ gap: 16 }}>
          <SectionHeader>Projekt</SectionHeader>
          {loading ? <LoadingSpinner /> : <ProjectsList projects={projects} />}
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout headerComponent={<Header title="Favoritprojekt" />}>
      {loading ? <LoadingSpinner /> : <ProjectsList projects={projects} />}
    </ScreenLayout>
  );
}
