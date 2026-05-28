import React from "react";
import { Header } from "@components/navigation/headers/header";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Headline } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";

const TITLE = "Sidan hittades inte";
const BODY = "Sidan du letar efter finns inte.";

export default function CustomNotFound() {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return (
      <ScreenLayout
        headerComponent={<TopBar theme="light" />}
        style={{ gap: 24 }}
        desktopFooter
      >
        <Header title={TITLE} showBackButton={false} />
        <Headline>{BODY}</Headline>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout headerComponent={<Header title={TITLE} />}>
      <Headline>{BODY}</Headline>
    </ScreenLayout>
  );
}
