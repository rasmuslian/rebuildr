export const setItem = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
  }
};

export const getItem = (key: string) => {
  if (typeof window === "undefined") return;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.error(`Error getting localStorage item "${key}":`, error);
    return undefined;
  }
};
