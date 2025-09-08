import { NextRequest, NextResponse } from "next/server";
import { LOGIN_PAGE, DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const session = !!accessToken && !!refreshToken;

  if (!session && !nextUrl.pathname.match(LOGIN_PAGE)) {
    return NextResponse.redirect(new URL(LOGIN_PAGE, nextUrl));
  }

  if (session && nextUrl.pathname.match(LOGIN_PAGE)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
