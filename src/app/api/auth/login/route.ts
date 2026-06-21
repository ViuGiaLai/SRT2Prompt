import { NextResponse } from "next/server";
import { signInWithEmail } from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await signInWithEmail({ email, password });
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not login.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
