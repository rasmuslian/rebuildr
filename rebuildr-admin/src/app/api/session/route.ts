import { NextResponse } from "next/server";
import { getSession } from "@/actions/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    isLoggedIn: session.isLoggedIn,
    accessToken: session.accessToken,
  });
}
