import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useQuery } from "@apollo/client";
import {
  GetFavoriteProjectsQuery,
  GetFavoriteProjectsQueryVariables,
} from "@/gql/graphql";
import { ProjectCard } from "@components/cards/project-card";
import { View } from "react-native";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const GET_FAVORITE_PROJECTS = gql`
  query GetFavoriteProjects {
    me {
      id
      likedProjects {
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
  }
`;

export default function FavoriteProjectsPage() {
  const { data, loading } = useQuery<
    GetFavoriteProjectsQuery,
    GetFavoriteProjectsQueryVariables
  >(GET_FAVORITE_PROJECTS);

  const projects = data?.me.likedProjects ?? [];
  const me = data?.me;

  return (
    <ScreenLayout headerComponent={<Header title="Favoritprojekt" />}>
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
