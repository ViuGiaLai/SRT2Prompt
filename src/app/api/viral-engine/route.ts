import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { analyzeVirality } from "@/src/lib/viral-engine";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();

    const { keyword, summary, videoType, thumbnailText } = body;

    if (!keyword || !summary) {
      return NextResponse.json(
        { error: "Target keyword and story summary are required." },
        { status: 400 }
      );
    }

    const analysis = await analyzeVirality(keyword, summary, videoType || "Horror Story", thumbnailText);

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Viral analysis failed.";
    console.error("Viral Engine API route error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
