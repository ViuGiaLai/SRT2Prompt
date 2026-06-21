import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { detectInputType, getSubtitleLines, groupScenes } from "./srt";
import type {
  CharacterBible,
  ContentPack,
  GenerateOptions,
  RegenerateSceneOptions,
  SceneGroup,
  ScenePrompt,
  StoryBeat,
  StoryboardScene,
  TitlePack
} from "./types";

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
      beat: options.scene.beat || "Opening",
      imagePrompt: `${options.imageStyle} refreshed image prompt for ${options.scene.beat || "Opening"} scene ${options.scene.sceneRange}: ${options.scene.summary}. Stronger composition, clear subject, consistent mood, practical AI image prompt, no gore, no copyrighted style.`,
      cameraAngle: options.scene.cameraAngle || "Wide shot",
      lighting: options.scene.lighting || "Moody cinematic lighting",
      emotion: options.scene.emotion || "Tense"
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
    beat: parsed.beat || options.scene.beat || "Opening",
    summary: parsed.summary || options.scene.summary,
    imagePrompt: parsed.imagePrompt || options.scene.imagePrompt,
    cameraAngle: parsed.cameraAngle || options.scene.cameraAngle || "Wide shot",
    lighting: parsed.lighting || options.scene.lighting || "Moody cinematic lighting",
    emotion: parsed.emotion || options.scene.emotion || "Tense"
  };
}

function parseJson(text: string) {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
    : trimmed;
  return JSON.parse(jsonText);
}

function buildCharacterBible(options: GenerateOptions, scenes: SceneGroup[]): CharacterBible {
  const firstSceneText = scenes[0]?.text || options.inputText.slice(0, 120);
  const recurringHint = /(?:he|she|they|his|her|their)\b/i.test(firstSceneText);

  return {
    name: recurringHint ? "Main Character" : "Core Subject",
    age: recurringHint ? "Adult" : "Unspecified",
    gender: recurringHint ? "Unspecified" : "Unspecified",
    hair: recurringHint ? "Consistent dark hair" : "No fixed character",
    clothes: recurringHint ? "Same outfit throughout the story" : "Scene-matched wardrobe",
    personality: recurringHint ? "Determined and emotionally readable" : "Stable visual identity",
    consistencyNotes: "Keep the same face, hair, clothing, and proportions across every scene."
  };
}

function getStoryBeat(index: number, total: number): StoryBeat {
  if (total <= 1) return "Opening";
  const ratio = index / Math.max(1, total - 1);
  if (ratio < 0.25) return "Opening";
  if (ratio < 0.6) return "Build-up";
  if (ratio < 0.85) return "Climax";
  return "Ending";
}

function makeCameraAngle(beat: StoryBeat, index: number) {
  const angles: Record<StoryBeat, string[]> = {
    Opening: ["Wide establishing shot", "Medium establishing shot"],
    "Build-up": ["Over-the-shoulder shot", "Medium shot", "Low angle shot"],
    Climax: ["Dramatic close-up", "Dutch angle", "Tight cinematic shot"],
    Ending: ["Wide emotional pullback", "Soft close-up"]
  };
  return angles[beat][index % angles[beat].length];
}

function makeLighting(beat: StoryBeat, videoType: string) {
  if (/horror|mystery/i.test(videoType)) {
    return beat === "Climax" ? "High-contrast horror lighting" : "Moody cinematic shadow lighting";
  }
  return beat === "Climax" ? "Dramatic cinematic lighting" : "Clean cinematic lighting";
}

function makeEmotion(beat: StoryBeat) {
  if (beat === "Opening") return "Curious";
  if (beat === "Build-up") return "Tense";
  if (beat === "Climax") return "Intense";
  return "Resolved";
}

function buildStoryboard(options: GenerateOptions, scenes: SceneGroup[]): StoryboardScene[] {
  return scenes.map((scene, index) => {
    const beat = getStoryBeat(index, scenes.length);
    return {
      sceneRange: scene.sceneRange,
      timestamp: scene.timestamp,
      beat,
      summary: scene.text.slice(0, 180),
      imagePrompt: `${options.imageStyle} storyboard frame for ${beat.toLowerCase()} beat: ${scene.text.slice(0, 280)}. Clear subject, readable composition, consistent character, cinematic framing, no gore, no copyrighted style.`,
      cameraAngle: makeCameraAngle(beat, index),
      lighting: makeLighting(beat, options.videoType),
      emotion: makeEmotion(beat)
    };
  });
}

function buildTitlePack(videoType: string, summary: string): TitlePack {
  return {
    curiosity: [
      `I Was Not Ready for This ${videoType}`,
      `The Moment Everything Changed in This Story`,
      `What Happens Next Is Hard to Ignore`,
      `This ${videoType} Hooked Me Instantly`,
      `I Found the Strongest Part of This Story`
    ],
    fear: [
      `This ${videoType} Gets Worse Every Minute`,
      `I Would Not Watch This Alone`,
      `The Tension Keeps Building Here`,
      `This Scene Feels Wrong in the Best Way`,
      `Something Is Very Off in This Story`
    ],
    question: [
      `Why Did This Happen in the First Place?`,
      `What Is the Main Character Hiding?`,
      `How Does This Story End?`,
      `Who Can Survive This Moment?`,
      `Can You Spot the Turning Point?`
    ],
    clickbait: [
      `I Turned This Into a Cinematic Story Pack`,
      `This One Scene Carries the Entire Video`,
      `The Best Part of This Story Is Here`,
      `This Is the Ending You Did Not Expect`,
      `A Full Storyboard Made From One Script`
    ]
  };
}

function flattenTitlePack(titlePack: TitlePack) {
  return [...titlePack.curiosity, ...titlePack.fear, ...titlePack.question, ...titlePack.clickbait];
}

function normalizeScenePrompt(scene: Partial<ScenePrompt>, fallback: ScenePrompt): ScenePrompt {
  return {
    sceneRange: scene.sceneRange || fallback.sceneRange,
    timestamp: scene.timestamp || fallback.timestamp,
    beat: scene.beat || fallback.beat,
    summary: scene.summary || fallback.summary,
    imagePrompt: scene.imagePrompt || fallback.imagePrompt,
    cameraAngle: scene.cameraAngle || fallback.cameraAngle,
    lighting: scene.lighting || fallback.lighting,
    emotion: scene.emotion || fallback.emotion
  };
}

function normalizeCharacterBible(value: Partial<CharacterBible> | undefined, fallback: CharacterBible): CharacterBible {
  return {
    name: value?.name || fallback.name,
    age: value?.age || fallback.age,
    gender: value?.gender || fallback.gender,
    hair: value?.hair || fallback.hair,
    clothes: value?.clothes || fallback.clothes,
    personality: value?.personality || fallback.personality,
    consistencyNotes: value?.consistencyNotes || fallback.consistencyNotes
  };
}

function normalizeTitlePack(value: Partial<TitlePack> | undefined, fallback: TitlePack): TitlePack {
  return {
    curiosity: normalizeTitleGroup(value?.curiosity, fallback.curiosity),
    fear: normalizeTitleGroup(value?.fear, fallback.fear),
    question: normalizeTitleGroup(value?.question, fallback.question),
    clickbait: normalizeTitleGroup(value?.clickbait, fallback.clickbait)
  };
}

function normalizeTitleGroup(value: unknown, fallback: string[]) {
  const titles = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  return titles.length ? titles : fallback;
}

function normalizeStoryboard(value: Partial<StoryboardScene>[] | undefined, fallback: StoryboardScene[]): StoryboardScene[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((scene, index) => normalizeStoryboardScene(scene, fallback[index] || fallback[0]));
}

function normalizeStoryboardScene(scene: Partial<StoryboardScene>, fallback: StoryboardScene): StoryboardScene {
  return {
    sceneRange: scene.sceneRange || fallback.sceneRange,
    timestamp: scene.timestamp || fallback.timestamp,
    beat: scene.beat || fallback.beat,
    summary: scene.summary || fallback.summary,
    imagePrompt: scene.imagePrompt || fallback.imagePrompt,
    cameraAngle: scene.cameraAngle || fallback.cameraAngle,
    lighting: scene.lighting || fallback.lighting,
    emotion: scene.emotion || fallback.emotion
  };
}

function normalizeContentPack(
  value: Partial<ContentPack>,
  options: GenerateOptions,
  scenes: SceneGroup[]
): ContentPack {
  const fallback = createMockContentPack(options, scenes);

  return {
    summary: value.summary || fallback.summary,
    videoType: value.videoType || options.videoType,
    imageStyle: value.imageStyle || options.imageStyle,
    language: value.language || options.language,
    characterBible: normalizeCharacterBible(value.characterBible, fallback.characterBible),
    scenePrompts: normalizeStoryboard(value.scenePrompts as Partial<ScenePrompt>[] | undefined, fallback.scenePrompts),
    storyboard: normalizeStoryboard(value.storyboard, fallback.storyboard),
    thumbnail: value.thumbnail || fallback.thumbnail,
    titlePack: normalizeTitlePack(value.titlePack, fallback.titlePack),
    titles: normalizeTitleGroup(value.titles, fallback.titles),
    description: value.description || fallback.description,
    hashtags: normalizeTitleGroup(value.hashtags, fallback.hashtags),
    keywords: normalizeTitleGroup(value.keywords, fallback.keywords)
  };
}

function applyOutputOptions(pack: ContentPack, options: GenerateOptions): ContentPack {
  const titlePack = options.includeTitles === false
    ? { curiosity: [], fear: [], question: [], clickbait: [] }
    : pack.titlePack;
  const titles = options.includeTitles === false ? [] : pack.titles;
  return {
    ...pack,
    thumbnail:
      options.includeThumbnail === false
        ? { prompt: "", textOverlay: "", compositionNotes: "" }
        : pack.thumbnail,
    titlePack,
    titles,
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

  const characterBible = buildCharacterBible(options, fallbackScenes);
  const scenePrompts = fallbackScenes.map((scene, index) => {
    const beat = getStoryBeat(index, fallbackScenes.length);
    return {
      sceneRange: scene.sceneRange,
      timestamp: scene.timestamp,
      beat,
      summary: scene.text.slice(0, 160),
      imagePrompt: `${options.imageStyle} storyboard frame for ${beat.toLowerCase()} beat: ${scene.text.slice(
        0,
        280
      )}. Keep the same character across scenes, readable composition, cinematic lighting, camera framing, and emotion-driven staging, no gore, no copyrighted style.`,
      cameraAngle: makeCameraAngle(beat, index),
      lighting: makeLighting(beat, options.videoType),
      emotion: makeEmotion(beat)
    };
  });
  const storyboard = scenePrompts.map((scene) => ({ ...scene }));
  const titlePack = buildTitlePack(options.videoType, scenePrompts[0]?.summary || options.inputText);

  return applyOutputOptions({
    summary:
      "A creator-ready story pack with consistent character guidance, storyboard beats, thumbnail direction, and YouTube metadata.",
    videoType: options.videoType,
    imageStyle: options.imageStyle,
    language: options.language,
    characterBible,
    scenePrompts,
    storyboard,
    thumbnail: {
      prompt: `${options.imageStyle} YouTube thumbnail showing the most dramatic moment from the story, one clear main subject, high contrast lighting, strong emotional expression, clean space for text, faceless video style, consistent character if present.`,
      textOverlay: options.videoType.includes("Horror") ? "DO NOT BREAK THE RULES" : "WHAT HAPPENS NEXT?",
      compositionNotes: "Main subject on the right, text space on the left, high contrast, simple readable layout."
    },
    titlePack,
    titles: flattenTitlePack(titlePack),
    description:
      "A faceless story production pack built from a script or subtitle file, with a character bible, storyboard beats, thumbnail direction, title angles, hashtags, and keywords ready for production.",
    hashtags: ["#facelessyoutube", "#storytelling", "#aivideo", "#storyboard", "#youtubecreator"],
    keywords: ["faceless video", "scene prompts", "youtube content", "srt to prompt", options.videoType]
  }, options);
}
