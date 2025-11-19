import { swedishPhoneNumberRegex } from 'src/constants/regexp';

export function formatCountryCodePhonenumber(phone: string) {
  return phone.replace(/^(0|0046)/, '+46');
}

export function isValidPhonenumber(phone: string) {
  const trimmed = phone.replace(/[^0-9+]/g, '');

  const result = swedishPhoneNumberRegex.test(trimmed);
  return result;
}
