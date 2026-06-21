import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/src/lib/auth";

export async function GET() {
  return NextResponse.redirect(getGoogleOAuthUrl());
}
