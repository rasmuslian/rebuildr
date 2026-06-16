import React, { Suspense, useState } from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { SectionHeader } from "@components/sections/section-header";
import { router, useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { useUser } from "@hooks/useUser";
import { GetProjectsQuery, GetProjectsQueryVariables } from "@/gql/graphql";
import {
  PROJECTS_LIST_FRAGMENT,
  ProjectsList,
} from "@components/project/projects-list";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { CreateProject } from "@components/project/create-project";
import { EditProject } from "@components/project/edit-project";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

export const GET_PROJECTS = gql`
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
  const { isDesktop } = useScreenType();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [showCreate, setShowCreate] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<
    GetProjectsQuery,
    GetProjectsQueryVariables
  >(GET_PROJECTS, {
    variables: { input: { id: userId }, isLoggedIn },
    onError: () => router.navigate("/"),
    skip: !userId,
  });

  const projects = data?.user.projects ?? [];
  const isOwnList = !!data?.me?.id && data.me.id === userId;
  const title = isOwnList ? "Dina projekt" : "Projekt";

  // Desktop manages create/edit in slide-in sheets; mobile navigates to routes.
  const onCreate = () => {
    if (isDesktop) {
      setShowCreate(true);
    } else {
      router.navigate("/(app)/project/create");
    }
  };

  const onEditProject = (id: string) => {
    if (isDesktop) {
      setEditProjectId(id);
    } else {
      router.navigate({
        pathname: "/(app)/project/edit/[projectId]",
        params: { projectId: id, ownerId: userId },
      });
    }
  };

  const sheets = isOwnList && (
    <>
      <SlideInSheet
        open={showCreate}
        title="Nytt projekt"
        onClose={() => setShowCreate(false)}
      >
        <CreateProject
          onCreate={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      </SlideInSheet>
      <SlideInSheet
        open={!!editProjectId}
        title="Redigera projekt"
        onClose={() => setEditProjectId(null)}
      >
        {editProjectId && (
          <Suspense fallback={<LoadingSpinner />}>
            <EditProject
              id={editProjectId}
              onEdited={() => {
                setEditProjectId(null);
                refetch();
              }}
              onDeleted={() => {
                setEditProjectId(null);
                refetch();
              }}
            />
          </Suspense>
        )}
      </SlideInSheet>
    </>
  );

  if (isDesktop) {
    return (
      <ScreenLayout
        headerComponent={<TopBar theme="light" />}
        loading={loading}
      >
        <View style={{ gap: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionHeader>{title}</SectionHeader>
            {isOwnList && (
              <Button
                label="Skapa projekt"
                icon="plus"
                onPress={onCreate}
              />
            )}
          </View>
          <ProjectsList
            projects={projects}
            onEditProject={isOwnList ? onEditProject : undefined}
          />
        </View>
        {sheets}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      headerComponent={
        <Header
          title={title}
          ctas={
            isOwnList ? [{ icon: "plus", onPress: onCreate }] : undefined
          }
        />
      }
      loading={loading}
    >
      <ProjectsList
        projects={projects}
        onEditProject={isOwnList ? onEditProject : undefined}
      />
      {sheets}
    </ScreenLayout>
  );
}
