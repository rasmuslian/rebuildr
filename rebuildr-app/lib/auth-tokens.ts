import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";

import { isLoggedInVar } from "@/apollo/state";

const TOKEN_REFRESH_LEEWAY_MS = 60_000;
export const AUTH_SESSION_EXPIRED_MESSAGE =
  "Din inloggning har gått ut. Logga in igen och försök igen.";

const GET_NEW_TOKENS_MUTATION = `
  mutation GetNewTokens($input: GetNewTokensInput!) {
    getNewTokens(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

type GetNewTokensPayload = {
  data?: {
    getNewTokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
  errors?: { message?: string }[];
};

let tokenRefreshPromise: Promise<string> | undefined;

export const getStoredAccessToken = async () => {
  return AsyncStorage.getItem("access_token");
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const accessToken = await getValidAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export const getValidAccessToken = async () => {
  const accessToken = await AsyncStorage.getItem("access_token");
  if (!accessToken) return undefined;
  if (!shouldRefreshAccessToken(accessToken)) return accessToken;

  try {
    return await renewStoredAuthTokens();
  } catch {
    throw new Error(AUTH_SESSION_EXPIRED_MESSAGE);
  }
};

export const renewStoredAuthTokens = async () => {
  if (tokenRefreshPromise) return tokenRefreshPromise;

  tokenRefreshPromise = refreshStoredAuthTokens().finally(() => {
    tokenRefreshPromise = undefined;
  });

  return tokenRefreshPromise;
};

export const clearStoredAuthTokens = async () => {
  await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
  isLoggedInVar(false);
};

const refreshStoredAuthTokens = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    const accessToken = await AsyncStorage.getItem("access_token");

    if (!refreshToken || !accessToken) {
      throw new Error("Missing tokens");
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_NEW_TOKENS_MUTATION,
        variables: { input: { refreshToken, accessToken } },
      }),
    });
    const payload = (await response.json()) as GetNewTokensPayload;
    const newTokens = payload.data?.getNewTokens;

    if (
      !response.ok ||
      payload.errors?.length ||
      !newTokens?.accessToken ||
      !newTokens?.refreshToken
    ) {
      throw new Error("Invalid token response");
    }

    await AsyncStorage.multiSet([
      ["access_token", newTokens.accessToken],
      ["refresh_token", newTokens.refreshToken],
    ]);
    isLoggedInVar(true);

    return newTokens.accessToken;
  } catch (error) {
    Sentry.captureException(error);
    await clearStoredAuthTokens();
    throw error;
  }
};

const shouldRefreshAccessToken = (accessToken: string) => {
  const expiresAtSeconds = readJwtExpiresAt(accessToken);
  if (!expiresAtSeconds) return false;

  return expiresAtSeconds * 1000 <= Date.now() + TOKEN_REFRESH_LEEWAY_MS;
};

const readJwtExpiresAt = (accessToken: string) => {
  const encodedPayload = accessToken.split(".")[1];
  if (!encodedPayload || typeof globalThis.atob !== "function") {
    return undefined;
  }

  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(globalThis.atob(paddedBase64)) as {
      exp?: number;
    };
    return payload.exp;
  } catch {
    return undefined;
  }
};
