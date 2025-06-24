import { TextStyle } from "react-native";

const displayBaseMobile: TextStyle = {
  fontFamily: "Poppins-SemiBold",
  fontWeight: 600,
  letterSpacing: -0.5,
};
const displayBaseDesktop: TextStyle = {
  fontFamily: "Poppins-SemiBold",
  fontWeight: 600,
  letterSpacing: -1,
};

const headlineBaseMobile: TextStyle = {
  fontFamily: "Poppins-Medium",
  fontWeight: 500,
  letterSpacing: -0.5,
};
const headlineBaseDesktop: TextStyle = {
  fontFamily: "Poppins-Medium",
  fontWeight: 500,
  letterSpacing: -1,
};

const titleBaseMobile: TextStyle = {
  letterSpacing: -0.5,
};
const titleBaseDesktop: TextStyle = {
  letterSpacing: -0.5,
};

const labelBaseMobile: TextStyle = {
  fontFamily: "Poppins-Medium",
  fontWeight: 500,
};
const labelBaseDesktop: TextStyle = {
  fontFamily: "Poppins-Medium",
  fontWeight: 500,
};

const bodyBaseMobile: TextStyle = {
  fontFamily: "Inter-Regular",
  fontWeight: 400,
};
const bodyBaseDesktop: TextStyle = {
  fontFamily: "Inter-Regular",
  fontWeight: 400,
};

export const textStyles = {
  display: {
    large: {
      //Mobile
      ...displayBaseMobile,
      fontSize: 45,
      lineHeight: 52,

      desktop: {
        ...displayBaseDesktop,
        fontSize: 57,
        lineHeight: 64,
      },
    },
    medium: {
      //Mobile
      ...displayBaseMobile,
      fontSize: 36,
      lineHeight: 44,

      desktop: {
        ...displayBaseDesktop,
        fontSize: 45,
        lineHeight: 52,
      },
    },
    small: {
      //Mobile
      ...displayBaseMobile,
      fontSize: 30,
      lineHeight: 36,

      desktop: {
        ...displayBaseDesktop,
        fontSize: 36,
        lineHeight: 44,
      },
    },
  },
  headline: {
    large: {
      //Mobile
      ...headlineBaseMobile,
      fontSize: 28,
      lineHeight: 36,

      desktop: {
        ...headlineBaseDesktop,
        fontSize: 32,
        lineHeight: 40,
      },
    },
    medium: {
      //Mobile
      ...headlineBaseMobile,
      fontSize: 24,
      lineHeight: 32,

      desktop: {
        ...headlineBaseDesktop,
        fontSize: 28,
        lineHeight: 36,
      },
    },
    small: {
      //Mobile
      ...headlineBaseMobile,
      fontSize: 20,
      lineHeight: 28,

      desktop: {
        ...headlineBaseDesktop,
        fontSize: 24,
        lineHeight: 32,
      },
    },
  },
  title: {
    large: {
      //Mobile
      ...titleBaseMobile,
      fontFamily: "Poppins-Medium",
      fontWeight: 400,
      fontSize: 22,
      lineHeight: 28,

      desktop: {
        ...titleBaseDesktop,
        fontFamily: "Poppins-Regular",
        fontWeight: 400,
        fontSize: 22,
        lineHeight: 28,
      },
    },
    medium: {
      //Mobile
      ...titleBaseMobile,
      fontFamily: "Poppins-Medium",
      fontWeight: 500,
      fontSize: 16,
      lineHeight: 24,

      desktop: {
        ...titleBaseDesktop,
        fontFamily: "Poppins-Medium",
        fontWeight: 500,
        fontSize: 18,
        lineHeight: 26,
      },
    },
    small: {
      //Mobile
      ...titleBaseMobile,
      fontFamily: "Poppins-SemiBold",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: 20,

      desktop: {
        ...titleBaseDesktop,
        fontFamily: "Poppins-Medium",
        fontWeight: 500,
        fontSize: 16,
        lineHeight: 24,
      },
    },
  },
  label: {
    large: {
      //Mobile
      ...labelBaseMobile,
      fontSize: 14,
      lineHeight: 20,

      desktop: {
        ...labelBaseDesktop,
        fontSize: 14,
        lineHeight: 20,
      },
    },
    medium: {
      //Mobile
      ...labelBaseMobile,
      fontSize: 12,
      lineHeight: 16,

      desktop: {
        ...labelBaseDesktop,
        fontSize: 12,
        lineHeight: 16,
      },
    },
    small: {
      //Mobile
      ...labelBaseMobile,
      fontSize: 11,
      lineHeight: 16,

      desktop: {
        ...labelBaseDesktop,
        fontSize: 11,
        lineHeight: 16,
      },
    },
  },
  body: {
    large: {
      //Mobile
      ...bodyBaseMobile,
      fontSize: 16,
      lineHeight: 24,

      desktop: {
        ...bodyBaseDesktop,
        fontSize: 16,
        lineHeight: 24,
      },
    },
    medium: {
      //Mobile
      ...bodyBaseMobile,
      fontSize: 14,
      lineHeight: 20,

      desktop: {
        ...bodyBaseDesktop,
        fontSize: 14,
        lineHeight: 20,
      },
    },
    small: {
      //Mobile
      ...bodyBaseMobile,
      fontSize: 12,
      lineHeight: 16,

      desktop: {
        ...bodyBaseDesktop,
        fontSize: 12,
        lineHeight: 16,
      },
    },
  },
} as const;

export type TextTypes = keyof typeof textStyles;
export type DisplaySize = keyof typeof textStyles.display;
export type HeadlineSize = keyof typeof textStyles.headline;
export type TitleSize = keyof typeof textStyles.title;
export type LabelSize = keyof typeof textStyles.label;
export type BodySize = keyof typeof textStyles.body;
