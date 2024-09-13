type TextColorsType = {
  primary: string;
  brand: string;
  white: string;
  pale: string;
  error: string;
  brandGreen: string;
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
  softGray: string;
  inactiveGray: string;
  green: string;
  brandGreen: string;
  pale: string;
  white: string;
  white2: string;
  white3: string;
  lavender: string;
  text: TextColorsType;
  button: ButtonColorsType;
};

const Colors: ColorsType = {
  brand: "#F8F1E3",
  blue: "#6666FF",
  borderGray: "#ABABAB",
  softGray: "#C9C9C9",
  inactiveGray: "#C1C1C1",
  green: "#00493E",
  brandGreen: "#0C5145",
  pale: "#FDFAF6",
  white: "#FFFFFF",
  white2: "#F9F9F9",
  white3: "#F6F6F6",
  lavender: "#F5EEFF",
  text: {
    primary: "#040404",
    brand: "#F2E6D1",
    white: "#FFFFFF",
    pale: "#828282",
    error: "#FF0000",
    brandGreen: "#0C5145",
  },
  button: {
    purple: "#863CFF",
    red: "#FF0000",
  },
};

export default Colors;
