import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";
import { getSession } from "@/actions/auth";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await getSession();

  const isLoggedIn = session.isLoggedIn;

  if (!isLoggedIn && !nextUrl.pathname.match(routes.LOGIN)) {
    console.log("redirect to login ...");
    return NextResponse.redirect(new URL(routes.LOGIN, nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname.match(routes.LOGIN)) {
    console.log("redirect to admin ...");
    return NextResponse.redirect(new URL(routes.ADMIN, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login"],
};
