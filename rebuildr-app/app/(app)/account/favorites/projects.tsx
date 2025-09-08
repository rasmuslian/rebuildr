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
  const { data, loading } = useQuery<
    GetFavoriteProjectsQuery,
    GetFavoriteProjectsQueryVariables
  >(GET_FAVORITE_PROJECTS);

  const projects = data?.me.likedProjects ?? [];

  return (
    <ScreenLayout headerComponent={<Header title="Favoritprojekt" />}>
      {loading ? <LoadingSpinner /> : <ProjectsList projects={projects} />}
    </ScreenLayout>
  );
}
