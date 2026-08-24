/**
 * Public marketplace base URL. Admin links out to it when the useful view is
 * the one visitors get — a listing's public page rather than its edit form.
 * Override per environment with NEXT_PUBLIC_SITE_URL (e.g. the staging site).
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rebuildr.se";

export const publicProductUrl = (productId: string) =>
  `${SITE_URL}/product/${productId}`;
