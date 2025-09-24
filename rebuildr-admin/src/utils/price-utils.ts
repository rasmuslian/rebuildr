export const formatPrice = (price?: number | null) => {
  if (price) {
    return price.toFixed(2).replace(".", ",") + " kr";
  }
  return null;
};
