export const numberToString = (n: number, nrOfDecimals: number) => {
  const nonDecimal = Math.round(n);
  const decimal = Math.round((n % nonDecimal) * 10 * nrOfDecimals);

  return `${nonDecimal},${decimal}`;
};
