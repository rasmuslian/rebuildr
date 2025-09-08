import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshMutation } from "@/queries/auth/refresh-mutation";

export async function POST() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const response = await refreshMutation({ accessToken, refreshToken });

    if (!response) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 },
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      newAccessToken: response.accessToken,
    });

    nextResponse.cookies.set("accessToken", response.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    nextResponse.cookies.set("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return nextResponse;
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
