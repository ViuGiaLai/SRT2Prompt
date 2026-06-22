import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { callGemini } from "@/src/lib/ai-gateway";
import { THUMBNAIL_SYSTEM_PROMPT, buildThumbnailPrompt, interpolateVariables } from "@/src/lib/node-prompts";
import type { GenerateOptions } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();

    const { videoType, imageStyle, language, summary, bestTitle, variables } = body;

    if (!summary || !bestTitle) {
      return NextResponse.json({ error: "Story summary and best title are required." }, { status: 400 });
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
      interpolateVariables(THUMBNAIL_SYSTEM_PROMPT, variables),
      interpolateVariables(buildThumbnailPrompt(options, summary, bestTitle), variables),
      0.8
    );

    return NextResponse.json({
      thumbnail: result.thumbnail
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Thumbnail node generation failed.";
    console.error("Thumbnail Node API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
