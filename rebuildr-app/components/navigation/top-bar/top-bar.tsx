import TopBarMobile from "./top-bar.mobile";
import TopBarDesktop from "./top-bar.desktop";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";

export default function TopBar({
  showFor = ["mobile", "desktop"],
  theme = "dark",
  showSearchBar = true,
  animateSearchBar = false,
}: {
  showFor?: ("mobile" | "desktop")[];
  theme?: "light" | "dark";
  showSearchBar?: boolean;
  animateSearchBar?: boolean;
}) {
  const { isLoggedIn, me } = useUser();
  const { isMobile } = useScreenType();

  if (isMobile) {
    if (showFor.includes("mobile") === true) {
      return <TopBarMobile isLoggedIn={isLoggedIn} me={me} />;
    }
    return null;
  }
  if (showFor.includes("desktop") === true) {
    return (
      <TopBarDesktop
        isLoggedIn={isLoggedIn}
        theme={theme}
        showSearchBar={showSearchBar}
        animateSearchBar={animateSearchBar}
        me={me}
      />
    );
  }
  return null;
}
