import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { getInputStats } from "@/src/lib/srt";
import { callGemini } from "@/src/lib/ai-gateway";
import { STORY_SYSTEM_PROMPT, buildStoryPrompt, interpolateVariables } from "@/src/lib/node-prompts";
import type { GenerateOptions } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();

    if (!body.inputText || body.inputText.trim().length < 10) {
      return NextResponse.json({ error: "Input must contain at least 10 characters." }, { status: 400 });
    }

    const videoType = body.videoType || "Horror Story";
    const imageStyle = body.imageStyle || "Dark Cinematic";
    const language = body.language || "English";
    const sceneGrouping = body.sceneGrouping || "Auto";

    const stats = getInputStats(body.inputText, sceneGrouping);
    const options: GenerateOptions = {
      inputText: body.inputText.trim(),
      inputType: stats.inputType,
      videoType,
      imageStyle,
      language,
      sceneGrouping,
      variables: body.variables
    };

    // Call Story Agent Node to analyze story, character bible and beats
    const result = await callGemini(
      interpolateVariables(STORY_SYSTEM_PROMPT, body.variables),
      interpolateVariables(buildStoryPrompt(options, stats.scenes), body.variables),
      0.7
    );

    return NextResponse.json({
      summary: result.summary,
      characterBible: result.characterBible,
      timeline: result.timeline || stats.scenes, // Fallback if Gemini fails to return timeline
      stats: {
        inputType: stats.inputType,
        characterCount: stats.characterCount,
        subtitleLines: stats.subtitleLines,
        estimatedScenes: stats.estimatedScenes
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Story node generation failed.";
    console.error("Story Node API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
