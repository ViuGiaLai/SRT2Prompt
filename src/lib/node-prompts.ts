import type { CharacterBible, GenerateOptions, SceneGroup, ScenePrompt, StoryBeat } from "./types";

const DEFAULT_VARIABLES: Record<string, string> = {
  platform: "YouTube",
  target_audience: "general audience",
  tone: "engaging",
  narrator_style: "storyteller"
};

export function interpolateVariables(template: string, variables: Record<string, string> = {}): string {
  let result = template;
  const merged = { ...DEFAULT_VARIABLES, ...variables };
  
  for (const [key, val] of Object.entries(merged)) {
    const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
    result = result.replace(reg, val || "");
  }
  
  // Clean up any remaining unresolved templates
  result = result.replace(/\{\{\s*\w+\s*\}\}/gi, "");
  
  return result;
}

export const STORY_SYSTEM_PROMPT = `
You are the Story Agent for SRT2Prompt.
Your job is to read an SRT subtitle or video script, summarize it, extract any recurring characters into a detailed character bible for visual consistency, and group the raw text into logical narrative beats (Opening, Build-up, Climax, Ending).

Important Context:
- Target Platform: {{platform}}
- Target Audience: {{target_audience}}
- Tone/Vibe: {{tone}}
- Narrator Style: {{narrator_style}}

Return a valid JSON object with the following structure:
{
  "summary": "Short summary of the story (1-2 sentences)",
  "characterBible": {
    "name": "Main Character Name",
    "age": "Age category",
    "gender": "Gender",
    "hair": "Hair style, color, description",
    "clothes": "Detailed description of consistent clothing matching the story setting",
    "personality": "Emotionally readable, expressive traits",
    "consistencyNotes": "Instructions to ensure visual continuity in AI image generation"
  },
  "timeline": [
    {
      "sceneRange": "e.g., 1-3",
      "timestamp": "e.g., 00:00:00,000 --> 00:00:15,000",
      "beat": "Opening",
      "text": "The transcript text combined for this scene range."
    }
  ]
}

Rule: Do not write chatbot responses. Return raw JSON only.
`;

export function buildStoryPrompt(options: GenerateOptions, scenes: SceneGroup[]): string {
  const scenesText = scenes.map(s => 
    `Scene ${s.sceneRange} [${s.timestamp}]: ${s.text}`
  ).join("\n");

  return `
Input Type: ${options.inputType}
Video Type: ${options.videoType}
Language: ${options.language}

Analyze the script below and return the summary, character bible, and grouped narrative beats as JSON.
Script/Subtitles:
${scenesText || options.inputText}
  `.trim();
}

export const SCENES_SYSTEM_PROMPT = `
You are the AI Art Director and Storyboard Scene Agent for SRT2Prompt.
Your job is to read the story summary, character bible, and narrative beats, and write detailed visual prompts for each scene.

Important Context:
- Video Platform: {{platform}}
- Target Audience: {{target_audience}}
- Tone/Mood: {{tone}}

For each scene, you must generate a highly descriptive image prompt suitable for FLUX or Midjourney, specifying:
1. Subject & actions (strictly maintaining character visual guidelines from the character bible).
2. Location & environment.
3. Camera shot angle (e.g., Extreme close-up, Dutch angle, establishing shot).
4. Lighting (e.g., High-contrast shadow, volumetric neon, golden hour).
5. Emotion and atmosphere (e.g., Terrified expression, eerie mystery).

Important Rules:
- Keep the visual details (clothing, hair, facial features) consistent across all scene prompts based on the character bible.
- Do not mention copyrighted character names (e.g. Harry Potter, Mickey Mouse) or specific artists.
- Avoid gore, blood, explicit violence, or physical trauma. Focus on suspense, dread, lighting, shadows, and expressive faces.
- Output MUST be in the selected language.

Return a valid JSON object:
{
  "scenePrompts": [
    {
      "sceneRange": "1-3",
      "timestamp": "00:00:00,000 --> 00:00:15,000",
      "beat": "Opening",
      "summary": "Short scene description",
      "imagePrompt": "Detailed visual image prompt",
      "cameraAngle": "establishing shot",
      "lighting": "moody dark shadow lighting",
      "emotion": "creepy anticipation"
    }
  ],
  "storyboard": [
    {
      "sceneRange": "1-3",
      "timestamp": "00:00:00,000 --> 00:00:15,000",
      "beat": "Opening",
      "summary": "Short scene description",
      "imagePrompt": "Detailed visual image prompt",
      "cameraAngle": "establishing shot",
      "lighting": "moody dark shadow lighting",
      "emotion": "creepy anticipation"
    }
  ]
}

Rule: Do not write chatbot responses. Return raw JSON only.
`;

export function buildScenesPrompt(options: GenerateOptions, summary: string, characterBible: CharacterBible, scenes: any[]): string {
  return `
Video Type: ${options.videoType}
Image Style: ${options.imageStyle}
Language: ${options.language}

Summary of Story:
${summary}

Character Bible Guidelines:
- Name: ${characterBible.name}
- Age: ${characterBible.age}
- Gender: ${characterBible.gender}
- Hair: ${characterBible.hair}
- Clothes: ${characterBible.clothes}
- Personality: ${characterBible.personality}
- Consistency Notes: ${characterBible.consistencyNotes}

Storyboard Beat Details:
${scenes.map((s: any) => `Scene ${s.sceneRange} (${s.timestamp}): ${s.text || s.summary}`).join("\n")}

Write scene prompts and storyboard items matching this structure in the requested style and output language.
`.trim();
}

export const SEO_SYSTEM_PROMPT = `
You are the Viral Growth SEO Agent for SRT2Prompt.
Your job is to generate highly engaging, high-CTR titles, a structured description, tags, hashtags, and keywords based on a video summary.

Important Context:
- Target Platform: {{platform}}
- Target Audience: {{target_audience}}
- Tone/Vibe: {{tone}}

Rules:
- Generate exactly 20 titles, categorized into: Curiosity (5), Fear/Tension (5), Question-based (5), and Clickbait hooks (5).
- Structure the video description for high search engine indexing density, including social calls to action.
- Suggest 8 to 12 relevant hashtags.
- Suggest 15 to 20 search keywords.
- Optimize the output for the target Video Type and Language.

Return a valid JSON object:
{
  "titles": ["List of all 20 titles"],
  "titlePack": {
    "curiosity": ["5 curiosity titles"],
    "fear": ["5 fear titles"],
    "question": ["5 question titles"],
    "clickbait": ["5 clickbait titles"]
  },
  "description": "Engaging description text containing hashtags, keywords, and CTA.",
  "hashtags": ["#tag1", "#tag2"],
  "keywords": ["keyword 1", "keyword 2"]
}

Rule: Do not write chatbot responses. Return raw JSON only.
`;

export function buildSeoPrompt(options: GenerateOptions, summary: string, keywords: string[]): string {
  return `
Video Type: ${options.videoType}
Language: ${options.language}
Current Keywords Seed: ${keywords.join(", ")}

Story Summary:
${summary}

Generate viral metadata (titles, description, keywords, hashtags) in the target language.
`.trim();
}

export const THUMBNAIL_SYSTEM_PROMPT = `
You are the AI Thumbnail Designer for SRT2Prompt.
Your job is to analyze the story summary and the best title, and draft a high-CTR thumbnail direction.

Important Context:
- Target Platform: {{platform}}
- Target Audience: {{target_audience}}
- Tone: {{tone}}

You must design:
1. A visual image prompt for Midjourney or FLUX that contains high-contrast composition, dramatic focus, and strong emotional characters.
2. Short text overlay (e.g. 2-4 words) that triggers curiosity or fear (e.g. "DONT ENTER", "HE LIED").
3. Composition notes directing character placement, colors, and font placement.

Return a valid JSON object:
{
  "thumbnail": {
    "prompt": "Highly detailed thumbnail image prompt",
    "textOverlay": "Short clicky text overlay",
    "compositionNotes": "Visual layout instructions, focal points, and lighting notes"
  }
}

Rule: Do not write chatbot responses. Return raw JSON only.
`;

export function buildThumbnailPrompt(options: GenerateOptions, summary: string, bestTitle: string): string {
  return `
Video Type: ${options.videoType}
Image Style: ${options.imageStyle}
Language: ${options.language}
Target Top Title: "${bestTitle}"

Story Summary:
${summary}

Write the thumbnail prompt and design details based on the summary and title.
`.trim();
}
