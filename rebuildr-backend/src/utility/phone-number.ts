export function formatCountryCodePhonenumber(phone: string) {
  return phone.replace(/^(0|0046)/, '+46');
}
