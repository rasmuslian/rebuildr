"use server";

import { LoginSchemaType } from "@/schema/login-schema";
import { loginMutation } from "@/queries/auth/login-mutation";
import { refreshMutation } from "@/queries/auth/refresh-mutation";
import { logoutMutation } from "@/queries/auth/logout-mutation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, defaultSession } from "@/lib/session";

type LoginResponseType = {
  success: boolean;
};

type LogutResponseType = {
  success: boolean;
};

type RefreshTokenResponseType = {
  success: boolean;
  accessToken?: string;
};

export const login = async (
  formData: LoginSchemaType,
): Promise<LoginResponseType> => {
  try {
    const response = await loginMutation(formData);
    if (!response) return { success: false };

    const session = await getSession();
    session.isLoggedIn = true;
    session.accessToken = response.accessToken;
    session.refreshToken = response.refreshToken;

    await session.save();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const logout = async (): Promise<LogutResponseType> => {
  const session = await getSession();
  const accessToken = session.accessToken;
  const refreshToken = session.refreshToken;

  if (accessToken && refreshToken) {
    const response = await logoutMutation({ accessToken, refreshToken });
    if (response) {
      try {
        const session = await getSession();
        session.destroy();

        return { success: true };
      } catch (error) {
        console.error(error);
        return { success: false };
      }
    }
  }

  return { success: false };
};

export const refreshToken = async (): Promise<RefreshTokenResponseType> => {
  const session = await getSession();
  const accessToken = session.accessToken;
  const refreshToken = session.refreshToken;

  if (accessToken && refreshToken) {
    try {
      const response = await refreshMutation({ accessToken, refreshToken });
      if (!response) throw new Error("Failed to refresh token!");

      session.isLoggedIn = true;
      session.accessToken = response.accessToken;
      session.refreshToken = response.refreshToken;
      await session.save();

      return { success: true, accessToken: response.accessToken };
    } catch (error) {
      console.error(error);
      session.destroy();
      return { success: false };
    }
  }

  return { success: false };
};

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
};
