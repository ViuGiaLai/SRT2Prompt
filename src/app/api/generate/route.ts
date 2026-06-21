import { NextResponse } from "next/server";
import { generateContentPack } from "@/src/lib/ai";
import { requireApiUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";
import { assertCanGenerate, getUsage, normalizePackForPlan, outputOptionsForPlan, recordGeneration } from "@/src/lib/plans";
import { detectInputType, getInputStats } from "@/src/lib/srt";
import type { GenerateOptions } from "@/src/lib/types";
import { getUserSettings } from "@/src/lib/user-settings";

export async function POST(request: Request) {
  let userId = "";
  let requestOptions: GenerateOptions | null = null;
  let statsForRecord: { subtitleLines: number; estimatedScenes: number } | null = null;

  try {
    const user = await requireApiUser();
    userId = user.id;
    const body = (await request.json()) as GenerateOptions;

    if (!body.inputText || body.inputText.trim().length < 10) {
      return NextResponse.json({ error: "Input must contain at least 10 characters." }, { status: 400 });
    }

    const inputType = body.inputType ?? detectInputType(body.inputText);
    const options: GenerateOptions = {
      ...body,
      inputText: body.inputText.trim(),
      inputType,
      videoType: body.videoType || "Horror Story",
      imageStyle: body.imageStyle || "Dark Cinematic",
      language: body.language || "English",
      sceneGrouping: body.sceneGrouping || "Auto"
    };
    requestOptions = options;

    const stats = getInputStats(options.inputText, options.sceneGrouping);
    statsForRecord = {
      subtitleLines: stats.subtitleLines,
      estimatedScenes: stats.estimatedScenes
    };
    const settings = await getUserSettings(user.id);
    const projects = await listProjects(user.id).catch(() => []);
    const usage = await getUsage(user.id, projects.length);
    assertCanGenerate(usage, {
      subtitleLines: stats.subtitleLines,
      imageStyle: options.imageStyle,
      language: options.language
    });

    const planOutputs = outputOptionsForPlan(usage.plan);
    const planOptions: GenerateOptions = {
      ...options,
      youtubeChannelId: options.youtubeChannelId || settings.youtubeChannelId || undefined,
      includeThumbnail: options.includeThumbnail !== false && planOutputs.includeThumbnail,
      includeTitles: options.includeTitles !== false && planOutputs.includeTitles,
      includeDescription: options.includeDescription !== false && planOutputs.includeDescription,
      includeHashtags: options.includeHashtags !== false && planOutputs.includeHashtags,
      includeKeywords: options.includeKeywords !== false && planOutputs.includeKeywords
    };

    const generatedPack = await generateContentPack(planOptions);
    const contentPack = normalizePackForPlan(generatedPack, usage.plan);

    await recordGeneration({
      userId: user.id,
      projectId: null,
      summary: contentPack.summary,
      videoType: String(contentPack.videoType),
      imageStyle: String(contentPack.imageStyle),
      language: String(contentPack.language),
      sceneCount: contentPack.scenePrompts.length,
      subtitleLines: stats.subtitleLines,
      status: "Completed",
      error: null
    });

    return NextResponse.json({
      contentPack,
      stats: {
        ...stats,
        scenes: undefined
      },
      usage: await getUsage(user.id, projects.length)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Generate failed.";
    if (userId && requestOptions) {
      await recordGeneration({
        userId,
        projectId: null,
        summary: "Generation failed",
        videoType: requestOptions.videoType,
        imageStyle: requestOptions.imageStyle,
        language: requestOptions.language,
        sceneCount: statsForRecord?.estimatedScenes || 0,
        subtitleLines: statsForRecord?.subtitleLines || 0,
        status: "Failed",
        error: message
      }).catch(() => null);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
