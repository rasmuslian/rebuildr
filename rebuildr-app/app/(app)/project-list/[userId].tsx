import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { router, useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { useUser } from "@hooks/useUser";
import { GetProjectsQuery, GetProjectsQueryVariables } from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  PROJECTS_LIST_FRAGMENT,
  ProjectsList,
} from "@components/project/projects-list";

const GET_PROJECTS = gql`
  query GetProjects($input: GetUserInput!, $isLoggedIn: Boolean!) {
    user(input: $input) {
      id
      username
      projects {
        ...ProjectsListFragment
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
  ${PROJECTS_LIST_FRAGMENT}
`;

export default function ProjectsPage() {
  const { isLoggedIn } = useUser();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data, loading } = useQuery<
    GetProjectsQuery,
    GetProjectsQueryVariables
  >(GET_PROJECTS, {
    variables: { input: { id: userId }, isLoggedIn },
    onError: () => router.navigate("/"),
    skip: !userId,
  });

  const projects = data?.user.projects ?? [];

  return (
    <ScreenLayout headerComponent={<Header title="Projekt" />}>
      {loading ? <LoadingSpinner /> : <ProjectsList projects={projects} />}
    </ScreenLayout>
  );
}
