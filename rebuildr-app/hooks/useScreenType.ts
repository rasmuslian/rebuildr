import { ScreenDimensionsContext } from "@context/screenDimensionsContext";
import { useContext } from "react";

export const useScreenType = () => {
  const breakPoint = useContext(ScreenDimensionsContext);
  const isDesktop = breakPoint === "desktop";

  return {
    isDesktop,
    isMobile: !isDesktop,
    breakPoint,
  };
};
