import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { callGemini } from "@/src/lib/ai-gateway";
import { syncCharacterMemory } from "@/src/lib/character-memory";
import { SCENES_SYSTEM_PROMPT, buildScenesPrompt, interpolateVariables } from "@/src/lib/node-prompts";
import type { GenerateOptions } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();

    const { videoType, imageStyle, language, summary, characterBible, scenes, variables } = body;

    if (!summary || !characterBible || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: "Story summary, character bible, and scene timeline are required." }, { status: 400 });
    }

    const options: GenerateOptions = {
      inputText: "",
      videoType: videoType || "Horror Story",
      imageStyle: imageStyle || "Dark Cinematic",
      language: language || "English",
      sceneGrouping: "Auto",
      variables
    };

    const result = await callGemini(
      interpolateVariables(SCENES_SYSTEM_PROMPT, variables),
      interpolateVariables(buildScenesPrompt(options, summary, characterBible, scenes), variables),
      0.7
    );

    // Dynamic prompt stitching using the Character Memory Engine
    const { scenePrompts, storyboard } = syncCharacterMemory(
      result.scenePrompts || [],
      result.storyboard || result.scenePrompts || [],
      characterBible,
      imageStyle || "Dark Cinematic"
    );

    return NextResponse.json({
      scenePrompts,
      storyboard
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Scenes node generation failed.";
    console.error("Scenes Node API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
