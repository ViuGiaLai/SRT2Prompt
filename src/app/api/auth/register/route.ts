import { NextResponse } from "next/server";
import { signUpWithEmail } from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must contain at least 6 characters." }, { status: 400 });
    }

    const user = await signUpWithEmail({ name, email, password });
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
