import { NextResponse } from "next/server";
import { setAuthCookies } from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = String(body.accessToken || "");
    const refreshToken = String(body.refreshToken || "");

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Auth tokens are required." }, { status: 400 });
    }

    setAuthCookies(accessToken, refreshToken);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save auth session." }, { status: 400 });
  }
}
