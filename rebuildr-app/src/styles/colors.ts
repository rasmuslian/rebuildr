type TextColorsType = {
  primary: string;
  brand: string;
  white: string;
  pale: string;
};
export type TextColors = keyof TextColorsType;

type ButtonColorsType = {
  purple: string;
  red: string;
};
export type ButtonColors = keyof ButtonColorsType;

type ColorsType = {
  brand: string;
  blue: string;
  borderGray: string;
  inactiveGray: string;
  green: string;
  pale: string;
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
  pale: "#FDFAF6",
  white: "#FFFFFF",
  text: {
    primary: "#040404",
    brand: "#F2E6D1",
    white: "#FFFFFF",
    pale: "#828282",
  },
  button: {
    purple: "#863CFF",
    red: "#FF0000",
  },
};

export default Colors;
