import { NextResponse } from "next/server";
import { getSession } from "@/actions/auth";
import { defaultSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  const { isLoggedIn, accessToken } = session;

  if (accessToken) {
    return NextResponse.json({
      isLoggedIn,
      accessToken,
    });
  } else {
    session.destroy();
    return NextResponse.json({
      isLoggedIn: defaultSession.isLoggedIn,
    });
  }
}
