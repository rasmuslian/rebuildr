import { Details } from "@components/login/details";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useLogout } from "@hooks/useLogout";
import { router } from "expo-router";
import React from "react";

export default function DetailsScreen() {
  const { logout } = useLogout();

  return (
    <ScreenLayout style={{ paddingTop: 16, paddingBottom: 16, flex: 1 }}>
      <Details
        onDone={() => {
          router.replace("/");
        }}
        onExit={() => {
          logout();
        }}
      />
    </ScreenLayout>
  );
}
