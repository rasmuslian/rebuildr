import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { Dimensions } from "react-native";

export interface MediaBreakPoints {
  desktop: number;
  mobile: number;
}

const mediaBreakPoints: MediaBreakPoints = {
  desktop: 1280,
  mobile: 360,
};

export const ScreenDimensionsContext =
  createContext<keyof MediaBreakPoints>("mobile");

export const ScreenDimensionsProvider = ({ children }: PropsWithChildren) => {
  const [breakPoint, setBreakPoint] = useState<keyof MediaBreakPoints>();

  useEffect(() => {
    const listener = Dimensions.addEventListener("change", ({ window }) => {
      const breakPoint = Object.keys(mediaBreakPoints).find((bp, i, array) => {
        if (window.width >= mediaBreakPoints[bp]) {
          return true;
        }

        //smallest breakpoint is last and works as default
        if (i === array.length - 1) {
          return true;
        }

        return false;
      });
      setBreakPoint(breakPoint as keyof MediaBreakPoints);
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <ScreenDimensionsContext.Provider value={breakPoint}>
      {children}
    </ScreenDimensionsContext.Provider>
  );
};
