import Colors from "src/styles/colors";

export const textStyles = {
  headline: {
    default: {
      fontFamily: "Poppins-SemiBold",
      fontSize: 32,
      letterSpacing: -0.02,
      medium: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 26,
        letterSpacing: -0.02,
      },
      small: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 20,
        letterSpacing: -0.02,
      },
    },
    section: {
      fontFamily: "Poppins-SemiBold",
      fontSize: 24,
      letterSpacing: -0.02,
    },
  },
  title: {
    default: {
      fontFamily: "Poppins-SemiBold",
      fontSize: 18,
      letterSpacing: -0.02,
    },
  },
  button: {
    default: {
      fontFamily: "Poppins-SemiBold",
      fontSize: 14,
      letterSpacing: 0.45,
    },
    detail: {
      fontFamily: "Poppins-Medium",
      fontSize: 12,
      letterSpaceing: -0.02,
    },
    largeBold: {
      fontFamily: "Poppins-Bold",
      fontSize: 16,
      letterSpacing: 0.45,
    },
    large: {
      fontFamily: "Poppins-Medium",
      fontSize: 16,
      letterSpacing: 0.45,
    },
  },
  body: {
    default: {
      fontFamily: "Poppins-Medium",
      fontSize: 14,
      letterSpacing: -0.02,
    },
  },
  label: {
    default: {
      fontFamily: "Poppins-Medium",
      fontSize: 16,
      letterSpacing: -0.02,
    },
  },
  input: {
    default: {
      fontFamily: "Inter-Regular",
      fontSize: 14,
      letterSpacing: 0,
      color: Colors.text.pale,
    },
    label: {
      fontFamily: "Poppins-Medium",
      fontSize: 14,
      letterSpacing: 0,
    },
    select: {
      fontFamily: "Poppins-Regular",
      fontSize: 12,
      letterSpacing: -0.02,
    },
  },
} as const;
export type TextType = keyof typeof textStyles;
export type TitleType = keyof typeof textStyles.title;
export type HeadlineType = keyof typeof textStyles.headline;
export type BodyType = keyof typeof textStyles.body;
export type LabelType = keyof typeof textStyles.label;
export type ButtonType = keyof typeof textStyles.button;
export type InputType = keyof typeof textStyles.input;
