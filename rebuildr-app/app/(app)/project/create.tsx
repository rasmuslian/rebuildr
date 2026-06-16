import React from "react";
import { router } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { CreateProject } from "@components/project/create-project";
import { useRequireAuth } from "@components/require-auth/require-auth";

export default function CreateProjectPage() {
  const { redirect } = useRequireAuth();

  if (redirect) return redirect;

  return (
    <ScreenLayout
      headerComponent={
        <Header
          title="Nytt projekt"
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
      <CreateProject
        onCreate={(id) =>
          router.replace({
            pathname: "/(app)/project/[projectId]",
            params: { projectId: id },
          })
        }
      />
    </ScreenLayout>
  );
}
