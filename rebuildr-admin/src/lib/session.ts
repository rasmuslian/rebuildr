import { SessionOptions } from "iron-session";

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET_KEY!,
  cookieName: "session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

export async function fetchSession(): Promise<SessionData> {
  const session = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/session`);
  const sessionData = await session.json();
  return sessionData;
}
