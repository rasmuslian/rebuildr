type TextColorsType = {
  primary: string;
  brand: string;
  white: string;
};

export type TextColors = keyof TextColorsType;

type ColorsType = {
  brand: string;
  blue: string;
  borderGray: string;
  inactiveGray: string;
  green: string;
  white: string;
  purple: string;
  text: TextColorsType;
};

const Colors: ColorsType = {
  brand: "#F8F1E3",
  blue: "#6666FF",
  borderGray: "#ABABAB",
  inactiveGray: "#C1C1C1",
  green: "#00493E",
  white: "#FFFFFF",
  purple: "#863CFF",
  text: {
    primary: "#040404",
    brand: "#F2E6D1",
    white: "#FFFFFF",
  },
};

export default Colors;
