import TopBarMobile from "./top-bar.mobile";
import TopBarDesktop from "./top-bar.desktop";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";

export default function TopBar({
  showFor = ["mobile", "desktop"],
  theme = "dark",
}: {
  showFor?: ("mobile" | "desktop")[];
  theme?: "light" | "dark";
}) {
  const { isLoggedIn } = useUser();
  const { isMobile } = useScreenType();

  if (isMobile) {
    if (showFor.includes("mobile") === true) {
      return <TopBarMobile isLoggedIn={isLoggedIn} />;
    }
    return null;
  }
  if (showFor.includes("desktop") === true) {
    return <TopBarDesktop isLoggedIn={isLoggedIn} theme={theme} />;
  }
  return null;
}
