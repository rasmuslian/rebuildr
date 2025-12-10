//Before release we will show <ComingSoon /> instead of the landing page.
//We bypass <ComingSoon /> if user comes from DO internal url.
export const shouldShowComingSoon = () => {
  const host = window?.location.hostname;

  const showComingSoon =
    !!process.env.EXPO_PUBLIC_SHOW_COMING_SOON &&
    !host.includes("rebuildr-app-ct5j6.ondigitalocean.app");

  return showComingSoon;
};
