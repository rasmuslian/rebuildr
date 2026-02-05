/**
 *
 * Validate website and returns it if valid, throws otherwise
 */
export const validateWebsite = (website: string) => {
  try {
    const url = new URL(website);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Website must start with http or https');
    }

    return website;
  } catch {
    throw new Error('Invalid url');
  }
};
