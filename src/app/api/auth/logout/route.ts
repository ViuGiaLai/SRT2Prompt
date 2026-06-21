import { NextResponse } from "next/server";
import { getAppUrl } from "@/src/lib/auth";

async function clearAuthCookies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const token = "";

  if (supabaseUrl && key) {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch(() => null);
  }
}

function clearCookieResponse(response: NextResponse) {
  response.cookies.set("srt2prompt_access_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("srt2prompt_refresh_token", "", { maxAge: 0, path: "/" });
  return response;
}

export async function POST() {
  await clearAuthCookies();
  const response = NextResponse.json({ ok: true });
  return clearCookieResponse(response);
}

export async function GET() {
  await clearAuthCookies();
  const response = NextResponse.redirect(new URL("/login", getAppUrl()));
  return clearCookieResponse(response);
}
