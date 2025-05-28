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
