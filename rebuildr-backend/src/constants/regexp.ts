export const swedishPhoneNumberRegex = new RegExp(
  /^(?:(?:\+46|0046|0)[ ]?\d{1,4}[ ]?\d{3}[ ]?\d{2}[ ]?\d{2})$/,
);

export const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])(?!.*(.)\1{2}).{8,}$/,
);

export const swedishPostCodeRegex = new RegExp(/^\d{3}([ ]|-)?\d{2}$/);
