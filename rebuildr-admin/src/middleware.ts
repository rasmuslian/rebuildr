import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";
import { getSession } from "@/actions/auth";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await getSession();

  const isLoggedIn = session.isLoggedIn;
  const isLoginRoute = Boolean(nextUrl.pathname.match(routes.LOGIN));
  console.log("isLoggedIn:", isLoggedIn, "isLoginRoute:", isLoginRoute);

  if (!isLoggedIn && !isLoginRoute) {
    return NextResponse.redirect(new URL(routes.LOGIN, nextUrl));
  }

  if (isLoggedIn && isLoginRoute) {
    return NextResponse.redirect(new URL(routes.ADMIN, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
  runtime: "nodejs",
};
