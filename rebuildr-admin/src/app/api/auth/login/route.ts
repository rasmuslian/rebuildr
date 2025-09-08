import { NextResponse } from "next/server";
import { loginMutation } from "@/queries/auth/login-mutation";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const response = await loginMutation({ email, password });

    if (!response) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }

    const nextResponse = NextResponse.json({ success: true });

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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
