"use server";

import { LoginSchemaType } from "@/schema/login-schema";
import { loginMutation } from "@/queries/auth/login-mutation";
import { refreshMutation } from "@/queries/auth/refresh-mutation";
import { cookies } from "next/headers";

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

    const cookieStore = cookies();

    cookieStore.set("accessToken", response.accessToken, {
      httpOnly: false,
      sameSite: "strict",
    });

    cookieStore.set("refreshToken", response.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const logout = async (): Promise<LogutResponseType> => {
  const cookieStore = cookies();

  try {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const refreshToken = async (): Promise<RefreshTokenResponseType> => {
  const cookieStore = cookies();

  try {
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const response = await refreshMutation({ accessToken, refreshToken });

    if (!response) throw new Error("Failed to refresh token!");

    cookieStore.set("accessToken", response.accessToken, {
      httpOnly: false,
      sameSite: "strict",
    });

    cookieStore.set("refreshToken", response.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    return { success: true, accessToken: response.accessToken };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};
