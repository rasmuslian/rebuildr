export const swedishPhoneNumberRegex = new RegExp(
  /^(?:\+46\s?7\d|0046\s?7\d|07\d)(?:[\s-]?\d){7}$/,
);

export const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])(?!.*(.)\1{2}).{8,}$/,
);

export const swedishPostCodeRegex = new RegExp(/^\d{3}([ ]|-)?\d{2}$/);
