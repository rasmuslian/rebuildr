import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "@hooks/useUser";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { EditProject } from "@components/project/edit-project";

export default function EditProjectPage() {
  const { me } = useUser();
  const { projectId, ownerId } = useLocalSearchParams<{
    projectId: string;
    ownerId: string;
  }>();

  const isMyProject = ownerId && ownerId === me?.id;

  if (!isMyProject) router.navigate("/");

  return (
    <ScreenLayout
      headerComponent={
        <Header
          title="Redigera projekt"
          ctas={[
            {
              icon: "X",
              onPress: () =>
                router.canGoBack() ? router.back() : router.navigate("/"),
            },
          ]}
        />
      }
    >
      <EditProject
        id={projectId}
        onEdited={() => router.dismiss(1)}
        onDeleted={() => {
          if (!me) {
            router.navigate("/");
            return;
          }
          router.replace({
            pathname: "/project-list/[userId]",
            params: { userId: me.id },
          });
        }}
      />
    </ScreenLayout>
  );
}
