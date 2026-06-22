import { NextResponse } from "next/server";
import { regenerateScenePrompt } from "@/src/lib/ai";
import { requireApiUser } from "@/src/lib/auth";
import { compileScenePrompt } from "@/src/lib/character-memory";
import type { RegenerateSceneOptions } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();

    if (!body.scene?.sceneRange) {
      return NextResponse.json({ error: "Scene description is required." }, { status: 400 });
    }

    // Call Gemini to regenerate the scene details (summary, camera, light, emotion)
    const sceneResult = await regenerateScenePrompt({
      scene: body.scene,
      videoType: body.videoType || "Horror Story",
      imageStyle: body.imageStyle || "Dark Cinematic",
      language: body.language || "English"
    });

    // Apply the Character Memory Engine to compile consistent prompts
    if (body.characterBible && body.characterBible.name) {
      sceneResult.imagePrompt = compileScenePrompt(
        {
          summary: sceneResult.summary || body.scene.summary || "",
          cameraAngle: sceneResult.cameraAngle || body.scene.cameraAngle,
          lighting: sceneResult.lighting || body.scene.lighting,
          emotion: sceneResult.emotion || body.scene.emotion
        },
        body.characterBible,
        body.imageStyle || "Dark Cinematic"
      );
    }

    return NextResponse.json({ scene: sceneResult });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not regenerate scene.";
    console.error("Regenerate Scene API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
