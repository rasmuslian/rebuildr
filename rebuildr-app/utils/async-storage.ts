import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key: string, value: unknown): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error setting AsyncStorage item "${key}":`, error);
  }
};

export const getItem = async (key: string): Promise<unknown | undefined> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : undefined;
  } catch (error) {
    console.error(`Error getting AsyncStorage item "${key}":`, error);
    return undefined;
  }
};
