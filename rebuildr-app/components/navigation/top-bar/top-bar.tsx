import TopBarMobile from "./top-bar.mobile";
import TopBarDesktop from "./top-bar.desktop";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";

export default function TopBar({
  showFor = ["mobile", "desktop"],
  theme = "dark",
  showSearchBar = true,
  animateSearchBar = false,
  sellButtonLabel,
  onSellButtonPress,
  backgroundColor,
  foregroundColor,
  showBottomBorder = true,
  categoriesButtonBackgroundColor,
}: {
  showFor?: ("mobile" | "desktop")[];
  theme?: "light" | "dark";
  showSearchBar?: boolean;
  animateSearchBar?: boolean;
  sellButtonLabel?: string;
  onSellButtonPress?: () => void;
  backgroundColor?: string;
  foregroundColor?: string;
  showBottomBorder?: boolean;
  categoriesButtonBackgroundColor?: string;
}) {
  const { isLoggedIn, me } = useUser();
  const { isMobile } = useScreenType();

  if (isMobile) {
    if (showFor.includes("mobile") === true) {
      return (
        <TopBarMobile
          isLoggedIn={isLoggedIn}
          me={me}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        />
      );
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
        sellButtonLabel={sellButtonLabel}
        onSellButtonPress={onSellButtonPress}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        showBottomBorder={showBottomBorder}
        categoriesButtonBackgroundColor={categoriesButtonBackgroundColor}
      />
    );
  }
  return null;
}
