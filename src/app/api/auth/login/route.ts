import { NextResponse } from "next/server";
import { signInWithEmail } from "@/src/lib/auth";

function setCookie(response: NextResponse, name: string, value: string, maxAge: number) {
  response.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { user, accessToken, refreshToken } = await signInWithEmail({ email, password });
    const response = NextResponse.json({ user });
    if (accessToken && refreshToken) {
      setCookie(response, "srt2prompt_access_token", accessToken, 60 * 60);
      setCookie(response, "srt2prompt_refresh_token", refreshToken, 60 * 60 * 24 * 30);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not login.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
