import { ScreenLayout } from "@components/screen-layout/screen-layout";
import AccountContent from "@components/account/account-content";
import { Header } from "@components/navigation/headers/header";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";

export default function Account() {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return (
      <ScreenLayout
        style={{ marginTop: 24, gap: 24 }}
        headerComponent={<TopBar theme="light" />}
        desktopFooter
      />
    );
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24 }}
      headerComponent={<Header title="Konto" />}
    >
      <AccountContent />
    </ScreenLayout>
  );
}
