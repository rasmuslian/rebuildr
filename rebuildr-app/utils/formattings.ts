//format the postal code on the format 123 45
export const formatPostCode = (postCode: string) => {
  const numberArray = postCode.trim().replace(" ", "").split("");
  if (numberArray.length !== 5) {
    return postCode;
  }

  const first = numberArray.slice(0, 3);
  const second = numberArray.slice(3, 5);
  return [...first, " ", ...second].join("");
};

export const formatPrice = (price?: number) => {
  if (price === undefined) {
    return "";
  }

  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatRating = (rating?: number) => {
  if (rating === undefined) {
    return "";
  }

  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(rating);
};

export const formatMeasurement = (measurement?: number) => {
  if (measurement === undefined) {
    return "";
  }

  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 5,
    minimumFractionDigits: 1,
  }).format(measurement);
};

export const formatCO2 = (co2: number) => {
  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(co2);
};

export const formatSwedishNumber = (number: string) => {
  return number.replace(/^(?:\+46|0046)/, "0");
};

export const formatOrgNumber = (number: string) => {
  const numberArray = number.trim().replace(" ", "").split("");
  if (numberArray.length !== 10) {
    return number;
  }

  const first = numberArray.slice(0, 6);
  const second = numberArray.slice(6, 10);
  return [...first, "-", ...second].join("");
};

export const parseFloatComma = (number: string) => {
  const commaToDot = number.replace(/,/g, ".");
  return parseFloat(commaToDot);
};
