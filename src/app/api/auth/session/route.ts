import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = String(body.accessToken || "");
    const refreshToken = String(body.refreshToken || "");

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Auth tokens are required." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("srt2prompt_access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });

    response.cookies.set("srt2prompt_refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Could not save auth session." }, { status: 400 });
  }
}
