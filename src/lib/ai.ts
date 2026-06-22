import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { detectInputType, getSubtitleLines, groupScenes } from "./srt";
import type {
  CharacterBible,
  CompetitorAnalysis,
  ContentPack,
  EngineSourceStatus,
  ImagePromptPreset,
  IntelligencePack,
  KeywordPack,
  GenerateOptions,
  RegenerateSceneOptions,
  SceneGroup,
  ScenePrompt,
  StoryBeat,
  StoryboardScene,
  ViralScore,
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
    let message = `Gemini error (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) {
        message = errorBody.error.message;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) message += `: ${text}`;
    }
    if (response.status === 503) {
      return createMockContentPack(normalizedOptions, scenes);
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = extractGeminiText(data);
  if (!text) {
    const message = buildGeminiEmptyResponseMessage(data);
    if (isGeminiBlocked(data)) {
      return createMockContentPack(normalizedOptions, scenes);
    }
    throw new Error(message);
  }

  const pack = applyOutputOptions(normalizeContentPack(parseJson(text), normalizedOptions, scenes), normalizedOptions);
  return enhanceWithMarketIntel(pack, normalizedOptions, scenes);
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
  const text = extractGeminiText(data);
  if (!text) {
    const message = buildGeminiEmptyResponseMessage(data);
    if (isGeminiBlocked(data)) {
      return {
        ...options.scene,
        beat: options.scene.beat || "Opening",
        imagePrompt: `${options.imageStyle} scene prompt for ${options.scene.beat || "Opening"} scene ${options.scene.sceneRange}: ${options.scene.summary}. Clear subject, cinematic composition, safe non-graphic tension, no gore, no copyrighted style.`,
        cameraAngle: options.scene.cameraAngle || "Wide shot",
        lighting: options.scene.lighting || "Moody cinematic lighting",
        emotion: options.scene.emotion || "Tense"
      };
    }
    throw new Error(message);
  }

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

function extractGeminiText(data: any) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  const textParts = parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean);
  return textParts.join("\n").trim();
}

function buildGeminiEmptyResponseMessage(data: any) {
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason ? ` finishReason=${candidate.finishReason}.` : "";
  const blockReason = data?.promptFeedback?.blockReason ? ` blockReason=${data.promptFeedback.blockReason}.` : "";
  const blockReasonMessage = data?.promptFeedback?.blockReasonMessage ? ` blockReasonMessage=${data.promptFeedback.blockReasonMessage}.` : "";
  return `Gemini returned no text.${finishReason}${blockReason}${blockReasonMessage}`.trim();
}

function isGeminiBlocked(data: any) {
  const finishReason = String(data?.candidates?.[0]?.finishReason || "").toUpperCase();
  const blockReason = String(data?.promptFeedback?.blockReason || "").toUpperCase();
  return finishReason.includes("PROHIBITED") || blockReason.includes("PROHIBITED") || blockReason.includes("SAFETY") || finishReason.includes("SAFETY");
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

function buildIntelligence(
  options: GenerateOptions,
  scenes: SceneGroup[],
  characterBible: CharacterBible,
  titlePack: TitlePack,
  scenePrompts: ScenePrompt[]
): IntelligencePack {
  const storyType = inferStoryType(options.videoType, options.inputText);
  const keywords = buildKeywordPack(options, scenes, storyType);
  const viralScore = buildViralScore(options, scenePrompts, titlePack, keywords);
  const competitorEngine = buildCompetitorEngine(storyType);
  const imagePromptPresets = buildImagePromptPresets(options.imageStyle);
  const sourceStatus = buildSourceStatus({
    youtubeData: process.env.YOUTUBE_API_KEY ? "fallback" : "missing_key",
    youtubeSuggest: "fallback",
    trends: "fallback",
    notion: process.env.NOTION_API_KEY && (process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_DATABASE_ID) ? "fallback" : "missing_key",
    drive:
      process.env.GOOGLE_DRIVE_ACCESS_TOKEN ||
      (process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        ? "fallback"
        : "missing_key"
  });

  return {
    storyType,
    storyEngine: {
      characters: [characterBible.name, ...(extractCharacterHints(options.inputText).slice(0, 3))],
      emotion: inferEmotionFromScenes(scenePrompts),
      timeline: scenePrompts.map((scene) => `${scene.beat}: ${scene.summary}`),
      structure: "Opening -> Build-up -> Climax -> Ending"
    },
    sceneEngine: {
      beats: scenePrompts.map((scene) => scene.beat),
      notes: [
        "Opening: establish the hook and location.",
        "Build-up: add tension and reveal risk.",
        "Climax: intensify emotion and visual contrast.",
        "Ending: resolve or tease the outcome."
      ]
    },
    characterMemory: characterBible,
    keywordPack: keywords,
    descriptionEngine: {
      seoDensity: "Balanced",
      cta: "Invite viewers to follow for more story packs.",
      timestampNote: "Use timestamps for each major beat.",
      hashtagPlacement: "Place hashtags at the end of the description."
    },
    hashtagEngine: {
      hashtags: keywords.secondary.slice(0, 3).map((tag) => `#${tag.replace(/\s+/g, "").toLowerCase()}`),
      sourceNotes: "Derived from the story theme and title pack."
    },
    competitorEngine,
    viralScore,
    imagePromptPresets,
    apiHooks: ["Gemini API", "YouTube Data API", "YouTube Search Suggest", "Google Trends API", "Supabase"],
    sourceStatus
  };
}

function inferStoryType(videoType: string, inputText: string) {
  if (/horror|creepy|scary/i.test(videoType) || /ghost|blood|night|dark/i.test(inputText)) return "Horror Story";
  if (/mystery|unknown|missing|secret/i.test(videoType) || /mystery|secret|hidden/i.test(inputText)) return "Mystery Story";
  if (/reddit/i.test(videoType)) return "Reddit Story";
  if (/bedtime/i.test(videoType)) return "Bedtime Story";
  return videoType;
}

function extractCharacterHints(inputText: string) {
  const matches = inputText.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  return Array.from(new Set(matches)).filter((item) => !["The", "This", "That", "Then", "When", "What"].includes(item));
}

function inferEmotionFromScenes(scenePrompts: ScenePrompt[]) {
  const emotions = scenePrompts.map((scene) => scene.emotion);
  if (emotions.includes("Intense")) return "Intense";
  if (emotions.includes("Tense")) return "Tense";
  if (emotions.includes("Curious")) return "Curious";
  return "Resolved";
}

function buildKeywordPack(options: GenerateOptions, scenes: SceneGroup[], storyType: string): KeywordPack {
  const base = [
    storyType,
    options.videoType,
    options.imageStyle,
    "storyboard",
    "faceless youtube"
  ];
  const sceneWords = scenes
    .flatMap((scene) => scene.text.split(/\s+/))
    .map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 4);
  const unique = Array.from(new Set([...base, ...sceneWords])).filter(Boolean);
  return {
    primary: unique[0] || "faceless video",
    secondary: unique.slice(1, 7),
    longTail: [
      `${storyType.toLowerCase()} scene prompts`,
      `${options.videoType.toLowerCase()} storyboard generator`,
      `${options.imageStyle.toLowerCase()} image prompt workflow`
    ]
  };
}

function buildViralScore(
  options: GenerateOptions,
  scenePrompts: ScenePrompt[],
  titlePack: TitlePack,
  keywords: KeywordPack
): ViralScore {
  const titleCount = titlePack.curiosity.length + titlePack.fear.length + titlePack.question.length + titlePack.clickbait.length;
  const emotionBoost = scenePrompts.some((scene) => ["Intense", "Tense"].includes(scene.emotion)) ? 8 : 4;
  const seo = Math.min(100, 78 + Math.min(10, keywords.secondary.length));
  const ctr = Math.min(100, 80 + Math.min(10, titleCount / 2));
  const emotion = Math.min(100, 72 + emotionBoost);
  const curiosity = Math.min(100, 76 + Math.min(12, titlePack.question.length * 2));
  const competition = Math.max(40, 70 - (options.videoType.includes("Horror") ? 6 : 0));
  const trend = Math.min(100, 65 + Math.min(20, keywords.secondary.length * 2));
  const overall = Math.round((seo + ctr + emotion + curiosity + competition + trend) / 6);

  return {
    seo,
    ctr,
    emotion,
    curiosity,
    competition,
    trend,
    overall,
    notes: [
      "Heuristic score based on structure, title variety, and emotional intensity.",
      "Connect real APIs later to replace these estimates with live market data."
    ]
  };
}

function buildCompetitorEngine(storyType: string): CompetitorAnalysis[] {
  const horrorCompetitors = ["Mr Nightmare", "Dr NoSleep", "Lighthouse Horror"];
  const genericCompetitors = ["Creator Economy Channel", "Story Channel", "Faceless Channel"];
  const seeds = /horror|mystery/i.test(storyType) ? horrorCompetitors : genericCompetitors;
  return seeds.map((name) => ({
    name,
    titlePatterns: ["Curiosity hook", "Suspense framing", "Short title"],
    thumbnailPatterns: ["One clear subject", "High contrast", "Simple face/emotion"],
    keywords: [storyType.toLowerCase(), "story", "thumbnail"],
    uploadTime: "Evening",
    descriptionPattern: "Short hook, concise context, clear CTA"
  }));
}

function buildImagePromptPresets(style: string): ImagePromptPreset {
  return {
    flux: `${style} visual for Flux with strong subject separation, clean edges, and cinematic lighting.`,
    midjourney: `${style} visual for Midjourney with cinematic detail, composition, and emotional contrast.`,
    chatgpt: `${style} visual for ChatGPT Image with a clear subject, scene context, and readable layout.`,
    leonardo: `${style} visual for Leonardo with sharp focus, contrast, and thumbnail clarity.`,
    gemini: `${style} visual for Gemini with cohesive scene design and consistent character style.`
  };
}

function buildSourceStatus(status: EngineSourceStatus): EngineSourceStatus {
  return status;
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

function normalizeIntelligence(
  value: Partial<IntelligencePack> | undefined,
  fallback: IntelligencePack,
  context: {
    options: GenerateOptions;
    scenes: SceneGroup[];
    characterBible: CharacterBible;
    scenePrompts: ScenePrompt[];
    titlePack: TitlePack;
  }
): IntelligencePack {
  if (!value) {
    return buildIntelligence(context.options, context.scenes, context.characterBible, context.titlePack, context.scenePrompts);
  }

  return {
    storyType: value.storyType || fallback.storyType,
    storyEngine: {
      characters: value.storyEngine?.characters?.length ? value.storyEngine.characters : fallback.storyEngine.characters,
      emotion: value.storyEngine?.emotion || fallback.storyEngine.emotion,
      timeline: value.storyEngine?.timeline?.length ? value.storyEngine.timeline : fallback.storyEngine.timeline,
      structure: value.storyEngine?.structure || fallback.storyEngine.structure
    },
    sceneEngine: {
      beats: value.sceneEngine?.beats?.length ? value.sceneEngine.beats : fallback.sceneEngine.beats,
      notes: value.sceneEngine?.notes?.length ? value.sceneEngine.notes : fallback.sceneEngine.notes
    },
    characterMemory: normalizeCharacterBible(value.characterMemory, fallback.characterMemory),
    keywordPack: {
      primary: value.keywordPack?.primary || fallback.keywordPack.primary,
      secondary: value.keywordPack?.secondary?.length ? value.keywordPack.secondary : fallback.keywordPack.secondary,
      longTail: value.keywordPack?.longTail?.length ? value.keywordPack.longTail : fallback.keywordPack.longTail
    },
    descriptionEngine: {
      seoDensity: value.descriptionEngine?.seoDensity || fallback.descriptionEngine.seoDensity,
      cta: value.descriptionEngine?.cta || fallback.descriptionEngine.cta,
      timestampNote: value.descriptionEngine?.timestampNote || fallback.descriptionEngine.timestampNote,
      hashtagPlacement: value.descriptionEngine?.hashtagPlacement || fallback.descriptionEngine.hashtagPlacement
    },
    hashtagEngine: {
      hashtags: value.hashtagEngine?.hashtags?.length ? value.hashtagEngine.hashtags : fallback.hashtagEngine.hashtags,
      sourceNotes: value.hashtagEngine?.sourceNotes || fallback.hashtagEngine.sourceNotes
    },
    competitorEngine: value.competitorEngine?.length ? value.competitorEngine : fallback.competitorEngine,
    viralScore: value.viralScore || fallback.viralScore,
    imagePromptPresets: value.imagePromptPresets || fallback.imagePromptPresets,
    apiHooks: value.apiHooks?.length ? value.apiHooks : fallback.apiHooks,
    sourceStatus: value.sourceStatus || fallback.sourceStatus
  };
}

function normalizeContentPack(
  value: Partial<ContentPack>,
  options: GenerateOptions,
  scenes: SceneGroup[]
): ContentPack {
  const fallback = createMockContentPack(options, scenes);
  const scenePrompts = normalizeStoryboard(value.scenePrompts as Partial<ScenePrompt>[] | undefined, fallback.scenePrompts);
  const storyboard = normalizeStoryboard(value.storyboard, fallback.storyboard);
  const titlePack = normalizeTitlePack(value.titlePack, fallback.titlePack);
  const characterBible = normalizeCharacterBible(value.characterBible, fallback.characterBible);
  const intelligence = normalizeIntelligence(value.intelligence, fallback.intelligence, {
    options,
    scenes,
    characterBible,
    scenePrompts,
    titlePack
  });

  return {
    summary: value.summary || fallback.summary,
    videoType: value.videoType || options.videoType,
    imageStyle: value.imageStyle || options.imageStyle,
    language: value.language || options.language,
    characterBible,
    scenePrompts,
    storyboard,
    thumbnail: value.thumbnail || fallback.thumbnail,
    titlePack,
    intelligence,
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
  const intelligence = buildIntelligence(options, fallbackScenes, characterBible, titlePack, scenePrompts);

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
    intelligence,
    titles: flattenTitlePack(titlePack),
    description:
      "A faceless story production pack built from a script or subtitle file, with a character bible, storyboard beats, thumbnail direction, title angles, hashtags, and keywords ready for production.",
    hashtags: ["#facelessyoutube", "#storytelling", "#aivideo", "#storyboard", "#youtubecreator"],
    keywords: ["faceless video", "scene prompts", "youtube content", "srt to prompt", options.videoType]
  }, options);
}

async function enhanceWithMarketIntel(pack: ContentPack, options: GenerateOptions, scenes: SceneGroup[]) {
  const query = [pack.intelligence.keywordPack.primary, options.videoType, pack.characterBible.name].filter(Boolean).join(" ");
  const [suggestions, youtubeSignals, trendsSignals] = await Promise.all([
    fetchYouTubeSuggestions(query),
    fetchYouTubeSignals(query, options.youtubeChannelId),
    fetchGoogleTrendsSignals(query)
  ]);

  const mergedKeywords = dedupe([
    pack.intelligence.keywordPack.primary,
    ...pack.intelligence.keywordPack.secondary,
    ...pack.intelligence.keywordPack.longTail,
    ...suggestions,
    ...youtubeSignals.keywords,
    ...trendsSignals
  ]).filter(Boolean);

  const titleSeeds = dedupe([
    ...pack.titlePack.curiosity,
    ...pack.titlePack.fear,
    ...pack.titlePack.question,
    ...pack.titlePack.clickbait,
    ...suggestions,
    ...youtubeSignals.titles
  ]);

  const titlePack: TitlePack = {
    curiosity: dedupe([...pack.titlePack.curiosity, ...titleSeeds.slice(0, 6)]).slice(0, 5),
    fear: dedupe([...pack.titlePack.fear, ...titleSeeds.slice(6, 12)]).slice(0, 5),
    question: dedupe([...pack.titlePack.question, ...titleSeeds.slice(12, 18)]).slice(0, 5),
    clickbait: dedupe([...pack.titlePack.clickbait, ...titleSeeds.slice(18, 24)]).slice(0, 5)
  };

  const competitorEngine = buildCompetitorAnalysisFromSignals(youtubeSignals.channels, pack.intelligence.competitorEngine);
  const viralScore = recalculateViralScore(pack.intelligence.viralScore, titlePack, mergedKeywords, youtubeSignals, trendsSignals);
  const imagePromptPresets = buildImagePromptPresets(pack.imageStyle);
  const sourceStatus = buildSourceStatus({
    youtubeData: youtubeSignals.titles.length > 0
      ? "live"
      : process.env.YOUTUBE_API_KEY
        ? "fallback"
        : "missing_key",
    youtubeSuggest: suggestions.length > 0 ? "live" : "fallback",
    trends: trendsSignals.length > 0 ? "live" : "fallback",
    notion: process.env.NOTION_API_KEY && (process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_DATABASE_ID) ? "fallback" : "missing_key",
    drive:
      process.env.GOOGLE_DRIVE_ACCESS_TOKEN ||
      (process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        ? "fallback"
        : "missing_key"
  });

  return {
    ...pack,
    titlePack,
    titles: flattenTitlePack(titlePack),
    keywords: dedupe([...pack.keywords, ...mergedKeywords]).slice(0, 24),
    hashtags: dedupe([
      ...pack.hashtags,
      ...mergedKeywords.slice(0, 4).map((item) => `#${item.replace(/\s+/g, "").toLowerCase()}`)
    ]).slice(0, 12),
    intelligence: {
      ...pack.intelligence,
      keywordPack: {
        primary: mergedKeywords[0] || pack.intelligence.keywordPack.primary,
        secondary: mergedKeywords.slice(1, 8),
        longTail: dedupe([...pack.intelligence.keywordPack.longTail, `${query} workflow`, `${options.videoType.toLowerCase()} content pack`]).slice(0, 6)
      },
      competitorEngine,
      viralScore,
      imagePromptPresets,
      apiHooks: dedupe([...pack.intelligence.apiHooks, "YouTube Data API", "YouTube Search Suggest", "Google Trends API"]),
      sourceStatus
    }
  };
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

async function fetchYouTubeSuggestions(query: string) {
  try {
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = (await response.json()) as [string, string[]];
    return Array.isArray(data?.[1]) ? data[1].slice(0, 10) : [];
  } catch {
    return [];
  }
}

async function fetchYouTubeSignals(query: string, channelId?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { titles: [] as string[], keywords: [] as string[], channels: [] as string[], topTitles: [] as string[], viewCounts: [] as number[] };

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.search = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "10",
      order: "viewCount",
      q: query,
      ...(channelId ? { channelId } : {}),
      key: apiKey
    }).toString();

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) return { titles: [], keywords: [], channels: [], topTitles: [] as string[], viewCounts: [] as number[] };
    const searchData: any = await searchResponse.json();
    const items: any[] = Array.isArray(searchData.items) ? searchData.items : [];
    const videoIds = items.map((item: any) => item?.id?.videoId).filter(Boolean).join(",");
    const titles = items.map((item: any) => item?.snippet?.title).filter((title: unknown): title is string => typeof title === "string").slice(0, 10);
    const channels = dedupe(items.map((item: any) => item?.snippet?.channelTitle).filter((channel: unknown): channel is string => typeof channel === "string")).slice(0, 5);
    const topTitles = titles.slice(0, 5);

    if (!videoIds) {
      return {
        titles,
        keywords: titles.flatMap((title) => title.split(/\s+/)).filter((word) => word.length > 3),
        channels,
        topTitles,
        viewCounts: []
      };
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.search = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds,
      key: apiKey
    }).toString();
    const videosResponse = await fetch(videosUrl);
    if (!videosResponse.ok) {
      return {
        titles,
        keywords: titles.flatMap((title: string) => title.split(/\s+/)).filter((word: string) => word.length > 3),
        channels,
        topTitles,
        viewCounts: []
      };
    }

    const videosData: any = await videosResponse.json();
    const videoItems: any[] = Array.isArray(videosData.items) ? videosData.items : [];
    const viewCounts = videoItems
      .map((item: any) => Number(item?.statistics?.viewCount || 0))
      .filter((value: number) => Number.isFinite(value) && value > 0)
      .sort((a: number, b: number) => b - a);
    const keywords = dedupe(
      videoItems.flatMap((item: any) => [
        item?.snippet?.title,
        ...(Array.isArray(item?.snippet?.tags) ? item.snippet.tags : []),
        item?.snippet?.channelTitle
      ]).filter(Boolean)
    );

    return {
      titles: dedupe([
        ...titles,
        ...videoItems.map((item: any) => item?.snippet?.title).filter((title: unknown): title is string => typeof title === "string")
      ]).slice(0, 10),
      keywords: keywords.slice(0, 16),
      channels,
      topTitles: dedupe([
        ...topTitles,
        ...videoItems.map((item: any) => item?.snippet?.title).filter((title: unknown): title is string => typeof title === "string")
      ]).slice(0, 5),
      viewCounts
    };
  } catch {
    return { titles: [], keywords: [], channels: [], topTitles: [] as string[], viewCounts: [] as number[] };
  }
}

async function fetchGoogleTrendsSignals(query: string) {
  try {
    const geo = process.env.GOOGLE_TRENDS_GEO || "US";
    const tz = process.env.GOOGLE_TRENDS_TZ || "0";
    const response = await fetch(`https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=${encodeURIComponent(tz)}&geo=${encodeURIComponent(geo)}&ns=15`);
    if (!response.ok) return [];
    const text = await response.text();
    const jsonText = text.replace(/^\)\]\}',?\n/, "");
    const data: any = JSON.parse(jsonText);
    const days: any[] = data?.default?.trendingSearchesDays || [];
    const searches = days.flatMap((day: any) => day?.trendingSearches || []);
    return dedupe(
      searches
        .map((item: any) => item?.title?.query || item?.formattedTraffic || "")
        .filter(Boolean)
    ).slice(0, 10);
  } catch {
    return [];
  }
}

function buildCompetitorAnalysisFromSignals(youtubeChannels: string[], fallback: CompetitorAnalysis[]) {
  const channels = dedupe(youtubeChannels);
  const extra = channels.map((name) => ({
    name,
    titlePatterns: ["Curiosity hook", "Suspense framing", "Short title"],
    thumbnailPatterns: ["One clear subject", "High contrast", "Readable emotion"],
    keywords: [name.toLowerCase(), "video", "story"],
    uploadTime: "Evening",
    descriptionPattern: "Short hook, concise context, clear CTA"
  }));
  return dedupeCompetitorAnalysis([...extra, ...fallback], 6);
}

function dedupeCompetitorAnalysis(items: CompetitorAnalysis[], limit: number) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function recalculateViralScore(
  current: ViralScore,
  titlePack: TitlePack,
  keywords: string[],
  youtubeSignals: { titles: string[]; keywords: string[]; channels: string[]; topTitles: string[]; viewCounts: number[] },
  trendsSignals: string[]
): ViralScore {
  const maxViews = youtubeSignals.viewCounts[0] || 0;
  const viewBoost = maxViews > 0 ? Math.min(10, Math.floor(Math.log10(maxViews))) : 0;
  const bonus = Math.min(10, youtubeSignals.titles.length + trendsSignals.length + viewBoost);
  const seo = Math.min(100, current.seo + Math.min(5, keywords.length / 2) + bonus);
  const ctr = Math.min(100, current.ctr + Math.min(6, titlePack.curiosity.length) + Math.min(4, titlePack.question.length));
  const emotion = Math.min(100, current.emotion + (titlePack.fear.length > 0 ? 3 : 0));
  const curiosity = Math.min(100, current.curiosity + Math.min(8, titlePack.question.length));
  const competition = Math.max(35, current.competition - Math.min(5, youtubeSignals.channels.length));
  const trend = Math.min(100, current.trend + Math.min(8, trendsSignals.length));
  const overall = Math.round((seo + ctr + emotion + curiosity + competition + trend) / 6);
  return {
    seo,
    ctr,
    emotion,
    curiosity,
    competition,
    trend,
    overall,
    notes: dedupe([
      ...current.notes,
      youtubeSignals.titles.length ? "YouTube Data API signals applied." : "",
      youtubeSignals.viewCounts.length ? `Top view count: ${youtubeSignals.viewCounts[0].toLocaleString()}.` : "",
      trendsSignals.length ? "Google Trends signals applied." : "",
      youtubeSignals.channels.length ? "YouTube channel signals applied." : ""
    ]).filter(Boolean)
  };
}
