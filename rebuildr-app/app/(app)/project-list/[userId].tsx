import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { router, useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { useUser } from "@hooks/useUser";
import { GetProjectsQuery, GetProjectsQueryVariables } from "@/gql/graphql";
import { ProjectCard } from "@components/cards/project-card";
import { View } from "react-native";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const GET_PROJECTS = gql`
  query GetProjects($input: GetUserInput!, $isLoggedIn: Boolean!) {
    user(input: $input) {
      id
      username
      projects {
        id
        title
        likedByMe
        projectPicture {
          id
          url
        }
        products {
          id
          status
          primaryImage {
            id
            url
          }
        }
        user {
          id
          profilePicture {
            id
            url
          }
        }
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
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
  const me = data?.me;

  return (
    <ScreenLayout headerComponent={<Header title="Projekt" />}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <View style={{ gap: 24 }}>
          {projects.map((project, index) => {
            return (
              <ProjectCard
                key={index}
                showHeart={project.user.id !== me?.id}
                project={project}
              />
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}
