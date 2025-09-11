import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const session = !!accessToken && !!refreshToken;

  if (!session && !nextUrl.pathname.match(routes.LOGIN)) {
    return NextResponse.redirect(new URL(routes.LOGIN, nextUrl));
  }

  if (session && nextUrl.pathname.match(routes.LOGIN)) {
    return NextResponse.redirect(new URL(routes.ADMIN, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
