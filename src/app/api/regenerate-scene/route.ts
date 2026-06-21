import { NextResponse } from "next/server";
import { regenerateScenePrompt } from "@/src/lib/ai";
import { requireApiUser } from "@/src/lib/auth";
import type { RegenerateSceneOptions } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = (await request.json()) as RegenerateSceneOptions;

    if (!body.scene?.imagePrompt || !body.scene?.sceneRange) {
      return NextResponse.json({ error: "Scene prompt is required." }, { status: 400 });
    }

    const scene = await regenerateScenePrompt({
      scene: body.scene,
      videoType: body.videoType || "Horror Story",
      imageStyle: body.imageStyle || "Dark Cinematic",
      language: body.language || "English"
    });

    return NextResponse.json({ scene });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not regenerate scene.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
