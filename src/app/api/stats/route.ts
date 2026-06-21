import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { getInputStats } from "@/src/lib/srt";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();
    const stats = getInputStats(body.inputText || "", body.sceneGrouping || "Auto");
    return NextResponse.json({
      inputType: stats.inputType,
      characterCount: stats.characterCount,
      subtitleLines: stats.subtitleLines,
      estimatedScenes: stats.estimatedScenes
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not calculate stats." }, { status: 500 });
  }
}
