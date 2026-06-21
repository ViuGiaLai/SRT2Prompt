import type { GenerateOptions, SceneGroup } from "./types";

export const SYSTEM_PROMPT = `
You are SRT2Prompt, an assistant for faceless YouTube and TikTok creators.

Your job is to convert a script or SRT subtitle into a complete video content pack.

You must produce structured, practical, ready-to-copy output.

Important rules:
- Do not write like a chatbot.
- Do not explain your process.
- Do not add unnecessary commentary.
- Do not generate copyrighted character names or copyrighted visual styles.
- Keep visual prompts consistent across scenes.
- Build a character bible when the input suggests recurring characters.
- Group the story into Opening, Build-up, Climax, and Ending rather than only raw line ranges.
- Derive a lightweight intelligence layer with story type, keyword pack, viral score, competitor notes, and image prompt presets.
- Keep prompts safe, non-graphic, and suitable for general content creation.
- Treat all violence as implied tension only.
- Avoid gore, blood, dismemberment, torture, injury closeups, and graphic physical harm.
- Prefer suspense, atmosphere, facial expression, lighting, and composition over explicit content.
- If the source text is dark, turn it into cinematic tension rather than explicit violence.
- If the input is SRT, preserve useful scene ranges and timestamps.
- Group subtitle lines into scenes based on story meaning, not randomly.
- Each image prompt must be visual, clear, and usable in an AI image generator.
- Avoid vague prompts.
- Avoid overly long prompts.
- Output must be valid JSON only.
`;

export function buildUserPrompt(options: GenerateOptions, scenes: SceneGroup[]) {
  const sceneText = scenes
    .map(
      (scene) => `Scene ${scene.sceneRange}
Timestamp: ${scene.timestamp}
Text: ${scene.text}`
    )
    .join("\n\n");
  const requestedSections = [
    "scene prompts",
    options.includeThumbnail !== false ? "thumbnail prompt" : null,
    options.includeTitles !== false ? "YouTube titles" : null,
    options.includeDescription !== false ? "description" : null,
    options.includeHashtags !== false ? "hashtags" : null,
    options.includeKeywords !== false ? "keywords" : null
  ].filter(Boolean).join(", ");

  return `
Convert the following input into a complete content pack for a faceless video.

INPUT TYPE:
${options.inputType}

VIDEO TYPE:
${options.videoType}

IMAGE STYLE:
${options.imageStyle}

OUTPUT LANGUAGE:
${options.language}

SCENE GROUPING:
${options.sceneGrouping}

REQUESTED OUTPUT SECTIONS:
${requestedSections}

SCENES:
${sceneText || options.inputText}

Return valid JSON only in this exact structure:

{
  "summary": "Short summary of the full video",
  "videoType": "${options.videoType}",
  "imageStyle": "${options.imageStyle}",
  "language": "${options.language}",
  "characterBible": {
    "name": "Main Character",
    "age": "Adult",
    "gender": "Unknown",
    "hair": "Short dark hair",
    "clothes": "Weather-appropriate story outfit",
    "personality": "Calm but tense",
    "consistencyNotes": "Keep the same face, hair, and clothes across every scene."
  },
  "intelligence": {
    "storyType": "Horror Story",
    "storyEngine": {
      "characters": ["Main Character"],
      "emotion": "Tense",
      "timeline": ["Opening: ...", "Build-up: ...", "Climax: ...", "Ending: ..."],
      "structure": "Opening -> Build-up -> Climax -> Ending"
    },
    "sceneEngine": {
      "beats": ["Opening", "Build-up", "Climax", "Ending"],
      "notes": ["Use camera, lighting, composition, and emotion per scene"]
    },
    "characterMemory": {
      "name": "Main Character",
      "age": "Adult",
      "gender": "Unspecified",
      "hair": "Short dark hair",
      "clothes": "Same outfit throughout",
      "personality": "Consistent and readable",
      "consistencyNotes": "Keep the same face, hair, clothing, and proportions across every scene."
    },
    "keywordPack": {
      "primary": "faceless video",
      "secondary": ["story prompts", "youtube content", "storyboard"],
      "longTail": ["srt to story pack", "faceless youtube story workflow"]
    },
    "descriptionEngine": {
      "seoDensity": "Balanced",
      "cta": "Subscribe for more story packs",
      "timestampNote": "Add timestamps for each major beat",
      "hashtagPlacement": "At the end of the description"
    },
    "hashtagEngine": {
      "hashtags": ["#storytelling", "#aivideo", "#facelessyoutube"],
      "sourceNotes": "Derived from content theme and story type"
    },
    "competitorEngine": [
      {
        "name": "Mr Nightmare",
        "titlePatterns": ["Curiosity", "Fear", "Suspense"],
        "thumbnailPatterns": ["Dark subject", "High contrast", "Simple composition"],
        "keywords": ["horror story", "nightmare", "creepy"],
        "uploadTime": "Evening",
        "descriptionPattern": "Short intro, story hook, simple CTA"
      }
    ],
    "viralScore": {
      "seo": 90,
      "ctr": 90,
      "emotion": 88,
      "curiosity": 92,
      "competition": 66,
      "trend": 72,
      "overall": 85,
      "notes": ["Strong hook", "Clear emotional tension", "Room to improve keyword targeting"]
    },
    "imagePromptPresets": {
      "flux": "Flux-style cinematic frame with strong subject separation, realistic lighting, and readable composition.",
      "midjourney": "Midjourney prompt emphasizing cinematic detail, dramatic lighting, and strong composition.",
      "chatgpt": "ChatGPT Image prompt with a clear subject, scene context, and emotional tone.",
      "leonardo": "Leonardo prompt for sharp facial expression, contrast, and thumbnail clarity.",
      "gemini": "Gemini image prompt for cohesive scene, lighting, and consistent character."
    },
    "apiHooks": ["Gemini API", "YouTube Data API", "YouTube Search Suggest", "Google Trends API", "Supabase"]
  },
  "scenePrompts": [
    {
      "sceneRange": "Example: 1-3",
      "timestamp": "Example: 00:00:00,000 --> 00:00:30,000",
      "beat": "Opening",
      "summary": "Short summary of this scene",
      "imagePrompt": "Detailed visual prompt for this scene",
      "cameraAngle": "Wide shot",
      "lighting": "Moody cinematic lighting",
      "emotion": "Tense"
    }
  ],
  "storyboard": [
    {
      "sceneRange": "Example: 1-3",
      "timestamp": "Example: 00:00:00,000 --> 00:00:30,000",
      "beat": "Opening",
      "summary": "Short summary of this storyboard beat",
      "imagePrompt": "Storyboard image prompt",
      "cameraAngle": "Wide shot",
      "lighting": "Moody cinematic lighting",
      "emotion": "Tense"
    }
  ],
  "thumbnail": {
    "prompt": "${options.includeThumbnail === false ? "" : "Thumbnail image prompt"}",
    "textOverlay": "${options.includeThumbnail === false ? "" : "Short thumbnail text"}",
    "compositionNotes": "${options.includeThumbnail === false ? "" : "Short notes about layout, emotion, and focus"}"
  },
  "titlePack": {
    "curiosity": [${options.includeTitles === false ? "" : `"Curiosity title 1", "Curiosity title 2", "Curiosity title 3", "Curiosity title 4", "Curiosity title 5"`}],
    "fear": [${options.includeTitles === false ? "" : `"Fear title 1", "Fear title 2", "Fear title 3", "Fear title 4", "Fear title 5"`}],
    "question": [${options.includeTitles === false ? "" : `"Question title 1", "Question title 2", "Question title 3", "Question title 4", "Question title 5"`}],
    "clickbait": [${options.includeTitles === false ? "" : `"Clickbait title 1", "Clickbait title 2", "Clickbait title 3", "Clickbait title 4", "Clickbait title 5"`}]
  },
  "titles": [
    ${options.includeTitles === false ? "" : `"Curiosity title 1",
    "Curiosity title 2",
    "Curiosity title 3",
    "Curiosity title 4",
    "Curiosity title 5",
    "Fear title 1",
    "Fear title 2",
    "Fear title 3",
    "Fear title 4",
    "Fear title 5",
    "Question title 1",
    "Question title 2",
    "Question title 3",
    "Question title 4",
    "Question title 5",
    "Clickbait title 1",
    "Clickbait title 2",
    "Clickbait title 3",
    "Clickbait title 4",
    "Clickbait title 5"`}
  ],
  "description": "${options.includeDescription === false ? "" : "YouTube description"}",
  "hashtags": [
    ${options.includeHashtags === false ? "" : `"#hashtag1",
    "#hashtag2",
    "#hashtag3"`}
  ],
  "keywords": [
    ${options.includeKeywords === false ? "" : `"keyword 1",
    "keyword 2",
    "keyword 3"`}
  ]
}

Rules for scene prompts:
- Each scene prompt must describe subject, location, mood, lighting, camera angle, and visual style.
- Keep the same character appearance if the story has recurring characters.
- Match every returned scenePrompt to the provided scene range and timestamp.
- Do not include camera movement unless needed.
- Do not include gore or explicit violent details.
- Do not mention exact copyrighted styles.
- Do not put text inside normal scene images unless it is a thumbnail.
- Image prompts should be 1 paragraph each.

Rules for character bible:
- Create one consistent main character when the input has a clear recurring person.
- Keep the details reusable across projects.
- If the story does not have a named character, use a stable generic identity.

Rules for titles:
- Return 20 titles total.
- Group them into curiosity, fear, question, and clickbait.
- Make them clickable but not misleading.
- Match the video type.
- For horror or mystery, create curiosity and tension.
- Do not use excessive clickbait.

Rules for hashtags:
- Use 5 to 10 hashtags.
- Keep them relevant.
- Use lowercase hashtags when possible.

Rules for output:
- JSON only.
- No markdown.
- No explanation.
- No extra text before or after JSON.
`;
}
