import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";
import { getSession } from "@/actions/auth";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await getSession();

  const pathname = nextUrl.pathname;
  const isLoggedIn = session.isLoggedIn;

  const isLoginRoute = pathname === routes.LOGIN;
  const isAdminRoute = pathname.startsWith(routes.ADMIN);

  console.log("pathname :>> ", pathname);
  console.log("isLoggedIn :>> ", isLoggedIn);
  console.log("isLoginRoute :>> ", isLoginRoute);
  console.log("isAdminRoute :>> ", isAdminRoute);

  if (isLoggedIn && isLoginRoute) {
    return NextResponse.redirect(new URL(routes.ADMIN, request.url));
  }

  if (!isLoggedIn && isAdminRoute) {
    return NextResponse.redirect(new URL(routes.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
