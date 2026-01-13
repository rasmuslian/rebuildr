const swedishColors = {
  // Neutrals
  vit: "#FFFFFF",
  svart: "#000000",
  gra: "#808080",
  ljusgra: "#D3D3D3",
  morkgra: "#404040",
  silver: "#C0C0C0",
  beige: "#F5F5DC",
  elfenben: "#FFFFF0",

  // Reds
  rod: "#FF0000",
  morkrod: "#8B0000",
  ljusrod: "#FF7F7F",
  vinrod: "#800020",
  rosa: "#FFC0CB",
  cerise: "#DE3163",

  // Blues
  bla: "#0000FF",
  ljusbla: "#ADD8E6",
  morkbla: "#00008B",
  marinbla: "#003366",
  turkos: "#40E0D0",
  cyan: "#00FFFF",

  // Greens
  gron: "#008000",
  ljusgron: "#90EE90",
  morkgron: "#006400",
  olivgron: "#808000",
  mintgron: "#98FF98",
  smaragdgron: "#50C878",

  // Yellows & oranges
  gul: "#FFFF00",
  ljusgul: "#FFFACD",
  senapsgul: "#FFDB58",
  orange: "#FFA500",
  morkorange: "#FF8C00",
  persika: "#FFDAB9",

  // Purples
  lila: "#800080",
  ljuslila: "#D8BFD8",
  morklila: "#4B0082",
  violett: "#EE82EE",

  // Browns
  brun: "#8B4513",
  ljusbrun: "#CD853F",
  morkbrun: "#654321",
  sand: "#C2B280",

  // Extras
  guld: "#FFD700",
  koppar: "#B87333",
};

const normalize = (str: string) =>
  str.toLowerCase().replace("å", "a").replace("ä", "a").replace("ö", "o");

export const swedishColorToHex = (color: string) => {
  const normalized = normalize(color);
  if (normalized in swedishColors) {
    return swedishColors[normalized as keyof typeof swedishColors];
  }
  return null;
};
