import React from "react";
import { Header } from "@components/navigation/headers/header";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Headline } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import RebuildrHead from "@components/meta-data/rebuildr-head";

const TITLE = "Sidan hittades inte";
const BODY = "Sidan du letar efter finns inte.";

export default function CustomNotFound() {
  const { isDesktop } = useScreenType();

  const head = (
    <RebuildrHead title={TITLE} description={BODY} noindex />
  );

  if (isDesktop) {
    return (
      <>
        {head}
        <ScreenLayout
          headerComponent={<TopBar theme="light" />}
          style={{ gap: 24 }}
          desktopFooter
        >
          <Header title={TITLE} showBackButton={false} headingLevel={1} />
          <Headline>{BODY}</Headline>
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      {head}
      <ScreenLayout headerComponent={<Header title={TITLE} headingLevel={1} />}>
        <Headline>{BODY}</Headline>
      </ScreenLayout>
    </>
  );
}
