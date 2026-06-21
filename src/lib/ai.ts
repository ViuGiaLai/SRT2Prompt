import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { detectInputType, getSubtitleLines, groupScenes } from "./srt";
import type { ContentPack, GenerateOptions, RegenerateSceneOptions, SceneGroup, ScenePrompt } from "./types";

export async function generateContentPack(options: GenerateOptions): Promise<ContentPack> {
  const inputType = options.inputType ?? detectInputType(options.inputText);
  const lines = getSubtitleLines(options.inputText, inputType);
  const scenes = groupScenes(lines, options.sceneGrouping);
  const normalizedOptions = { ...options, inputType };

  if (!process.env.GEMINI_API_KEY) {
    return createMockContentPack(normalizedOptions, scenes);
  }

  const prompt = buildUserPrompt(normalizedOptions, scenes);
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${message}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");

  return applyOutputOptions(normalizeContentPack(parseJson(text), normalizedOptions, scenes), normalizedOptions);
}

export async function regenerateScenePrompt(options: RegenerateSceneOptions): Promise<ScenePrompt> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      ...options.scene,
      imagePrompt: `${options.imageStyle} refreshed image prompt for scene ${options.scene.sceneRange}: ${options.scene.summary}. Stronger composition, clear subject, consistent mood, practical AI image prompt, no gore, no copyrighted style.`
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Regenerate only this scene prompt as valid JSON.

Video type: ${options.videoType}
Image style: ${options.imageStyle}
Language: ${options.language}
Scene range: ${options.scene.sceneRange}
Timestamp: ${options.scene.timestamp}
Scene summary: ${options.scene.summary}
Current prompt: ${options.scene.imagePrompt}

Return exactly:
{
  "sceneRange": "${options.scene.sceneRange}",
  "timestamp": "${options.scene.timestamp}",
  "summary": "Short summary of this scene",
  "imagePrompt": "One improved visual image prompt"
}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${message}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");

  const parsed = parseJson(text) as Partial<ScenePrompt>;
  return {
    sceneRange: parsed.sceneRange || options.scene.sceneRange,
    timestamp: parsed.timestamp || options.scene.timestamp,
    summary: parsed.summary || options.scene.summary,
    imagePrompt: parsed.imagePrompt || options.scene.imagePrompt
  };
}

function parseJson(text: string) {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
    : trimmed;
  return JSON.parse(jsonText);
}

function normalizeContentPack(
  value: Partial<ContentPack>,
  options: GenerateOptions,
  scenes: SceneGroup[]
): ContentPack {
  const scenePrompts =
    Array.isArray(value.scenePrompts) && value.scenePrompts.length > 0
      ? value.scenePrompts
      : createMockContentPack(options, scenes).scenePrompts;

  return {
    summary: value.summary || "Generated content pack summary.",
    videoType: value.videoType || options.videoType,
    imageStyle: value.imageStyle || options.imageStyle,
    language: value.language || options.language,
    scenePrompts,
    thumbnail: value.thumbnail || {
      prompt: "A creator-ready YouTube thumbnail based on the strongest story moment.",
      textOverlay: "WATCH UNTIL THE END",
      compositionNotes: "Main subject large, strong contrast, clean text space."
    },
    titles: Array.isArray(value.titles) ? value.titles : [],
    description: value.description || "",
    hashtags: Array.isArray(value.hashtags) ? value.hashtags : [],
    keywords: Array.isArray(value.keywords) ? value.keywords : []
  };
}

function applyOutputOptions(pack: ContentPack, options: GenerateOptions): ContentPack {
  return {
    ...pack,
    thumbnail:
      options.includeThumbnail === false
        ? { prompt: "", textOverlay: "", compositionNotes: "" }
        : pack.thumbnail,
    titles: options.includeTitles === false ? [] : pack.titles,
    description: options.includeDescription === false ? "" : pack.description,
    hashtags: options.includeHashtags === false ? [] : pack.hashtags,
    keywords: options.includeKeywords === false ? [] : pack.keywords
  };
}

function createMockContentPack(options: GenerateOptions, scenes: SceneGroup[]): ContentPack {
  const fallbackScenes = scenes.length > 0 ? scenes : [
    {
      sceneRange: "1",
      timestamp: "Script segment",
      text: options.inputText.slice(0, 400),
      lines: []
    }
  ];

  return applyOutputOptions({
    summary:
      "A creator-ready video content pack generated from the submitted SRT or script, organized into visual scenes and YouTube metadata.",
    videoType: options.videoType,
    imageStyle: options.imageStyle,
    language: options.language,
    scenePrompts: fallbackScenes.map((scene) => ({
      sceneRange: scene.sceneRange,
      timestamp: scene.timestamp,
      summary: scene.text.slice(0, 160),
      imagePrompt: `${options.imageStyle} image of the key moment from this ${options.videoType.toLowerCase()} scene: ${scene.text.slice(
        0,
        280
      )}. Clear subject, readable composition, cinematic lighting, consistent character design, no gore, no copyrighted style.`
    })),
    thumbnail: {
      prompt: `${options.imageStyle} YouTube thumbnail showing the most dramatic moment from the story, one clear main subject, high contrast lighting, strong emotional expression, clean space for text, faceless video style.`,
      textOverlay: options.videoType.includes("Horror") ? "DO NOT BREAK THE RULES" : "WHAT HAPPENS NEXT?",
      compositionNotes: "Main subject on the right, text space on the left, high contrast, simple readable layout."
    },
    titles: [
      "I Found Something Strange in This Story",
      "This Script Has a Twist I Did Not Expect",
      "The Moment Everything Changed",
      "I Turned This Story Into a Faceless Video Pack",
      "A Complete Storytelling Video Idea From One SRT"
    ],
    description:
      "A faceless video story built from a script or subtitle file, with scene prompts, thumbnail direction, titles, hashtags, and keywords ready for production.",
    hashtags: ["#facelessyoutube", "#storytelling", "#aivideo", "#imageprompts", "#youtubecreator"],
    keywords: ["faceless video", "scene prompts", "youtube content", "srt to prompt", options.videoType]
  }, options);
}
