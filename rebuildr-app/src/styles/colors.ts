type TextColorsType = {
  primary: string;
  brand: string;
  white: string;
};
export type TextColors = keyof TextColorsType;

type ButtonColorsType = {
  purple: string;
};
export type ButtonColors = keyof ButtonColorsType;

type ColorsType = {
  brand: string;
  blue: string;
  borderGray: string;
  inactiveGray: string;
  green: string;
  white: string;
  text: TextColorsType;
  button: ButtonColorsType;
};

const Colors: ColorsType = {
  brand: "#F8F1E3",
  blue: "#6666FF",
  borderGray: "#ABABAB",
  inactiveGray: "#C1C1C1",
  green: "#00493E",
  white: "#FFFFFF",
  text: {
    primary: "#040404",
    brand: "#F2E6D1",
    white: "#FFFFFF",
  },
  button: {
    purple: "#863CFF",
  },
};

export default Colors;
