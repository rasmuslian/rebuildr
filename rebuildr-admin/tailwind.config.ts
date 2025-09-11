import type { Config } from "tailwindcss";

const colors = {
  primary_100: "#E9F6ED",
  primary_200: "#D6E6DC",
  primary_300: "#70AEA3",
  primary_400: "#5EA193",
  primary_500: "#4B9382",
  primary_600: "#417D6E",
  primary_700: "#176457",
  primary_800: "#00493E",
  primary_900: "#00332B",

  secondary_100: "#FBF8F1",
  secondary_200: "#F8F1E3",
  secondary_300: "#F2E6D1",
  secondary_400: "#E9DCC5",
  secondary_500: "#DFD2BA",
  secondary_600: "#C0B196",
  secondary_700: "#8B7E65",
  secondary_800: "#564A34",
  secondary_900: "#30291D",

  neutrals_10: "#FFFFFF0D",
  neutrals_50: "#FFFFFF4D",
  neutrals_90: "#FFFFFFE6",
  neutrals_100: "#FFFFFF",
  neutrals_200: "#E6E6E6",
  neutrals_300: "#C7C7C7",
  neutrals_400: "#AEAEAE",
  neutrals_500: "#959595",
  neutrals_600: "#616161",
  neutrals_700: "#4B4B4B",
  neutrals_800: "#323232",
  neutrals_900: "#1E1E1E",

  accent_100: "#F5EFFF",
  accent_200: "#DDC7FF",
  accent_300: "#AC82FF",
  accent_400: "#995FFF",
  accent_500: "#863CFF",
  accent_600: "#7E24F3",
  accent_700: "#7017DD",
  accent_800: "#5A0BBC",
  accent_900: "#40048E",

  semantic_error_100: "#FFEDEB",
  semantic_error_200: "#FFDAD7",
  semantic_error_300: "#FFB3AD",
  semantic_error_400: "#FF8981",
  semantic_error_500: "#E66A63",
  semantic_error_600: "#C5524C",
  semantic_error_700: "#A53A36",
  semantic_error_800: "#852221",
  semantic_error_900: "#65090E",

  ghost: "#fafafa",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        success: colors.primary_900,
        error: colors.semantic_error_600,
        gray: colors.neutrals_600,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
