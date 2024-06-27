type TextColorsType = {
  primary: string;
  brand: string;
  white: string;
};

export type TextColors = keyof TextColorsType;

type ColorsType = {
  orange: string;
  blue: string;
  borderGray: string;
  green: string;
  text: TextColorsType;
};

const Colors: ColorsType = {
  orange: "#F8F1E3",
  blue: "#6666FF",
  borderGray: "#ABABAB",
  green: "#00493E",
  text: {
    primary: "#040404",
    brand: "#F2E6D1",
    white: "#FFFFFF",
  },
};

export default Colors;
