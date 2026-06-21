import type { ContentPack } from "./types";

export function exportAsText(pack: ContentPack) {
  return [
    "VIDEO SUMMARY",
    pack.summary,
    "",
    "CHARACTER BIBLE",
    `Name: ${pack.characterBible.name}`,
    `Age: ${pack.characterBible.age}`,
    `Gender: ${pack.characterBible.gender}`,
    `Hair: ${pack.characterBible.hair}`,
    `Clothes: ${pack.characterBible.clothes}`,
    `Personality: ${pack.characterBible.personality}`,
    `Consistency Notes: ${pack.characterBible.consistencyNotes}`,
    "",
    "STORYBOARD",
    ...pack.storyboard.flatMap((scene) => [
      "",
      `Scene ${scene.sceneRange} - ${scene.beat}`,
      scene.timestamp,
      `Summary: ${scene.summary}`,
      `Camera: ${scene.cameraAngle}`,
      `Lighting: ${scene.lighting}`,
      `Emotion: ${scene.emotion}`,
      `Prompt: ${scene.imagePrompt}`
    ]),
    "",
    "SCENE PROMPTS",
    ...pack.scenePrompts.flatMap((scene) => [
      "",
      `Scene ${scene.sceneRange} - ${scene.beat}`,
      scene.timestamp,
      `Summary: ${scene.summary}`,
      `Camera: ${scene.cameraAngle}`,
      `Lighting: ${scene.lighting}`,
      `Emotion: ${scene.emotion}`,
      `Prompt: ${scene.imagePrompt}`
    ]),
    ...(pack.thumbnail.prompt
      ? [
          "",
          "THUMBNAIL PROMPT",
          pack.thumbnail.prompt,
          `Text Overlay: ${pack.thumbnail.textOverlay}`,
          `Composition Notes: ${pack.thumbnail.compositionNotes}`
        ]
      : []),
    ...(pack.titles.length ? ["", "YOUTUBE TITLES", ...pack.titles.map((title, index) => `${index + 1}. ${title}`)] : []),
    ...(pack.titlePack.curiosity.length
      ? ["", "TITLE PACK", "Curiosity", ...pack.titlePack.curiosity.map((title) => `- ${title}`), "Fear", ...pack.titlePack.fear.map((title) => `- ${title}`), "Question", ...pack.titlePack.question.map((title) => `- ${title}`), "Clickbait", ...pack.titlePack.clickbait.map((title) => `- ${title}`)]
      : []),
    ...(pack.description ? ["", "DESCRIPTION", pack.description] : []),
    ...(pack.hashtags.length ? ["", "HASHTAGS", pack.hashtags.join(" ")] : []),
    ...(pack.keywords.length ? ["", "KEYWORDS", pack.keywords.join(", ")] : [])
  ].filter((line) => line !== undefined).join("\n");
}

export function exportAsMarkdown(pack: ContentPack) {
  return [
    "# SRT2Prompt Content Pack",
    "",
    "## Summary",
    pack.summary,
    "",
    "## Character Bible",
    `- **Name:** ${pack.characterBible.name}`,
    `- **Age:** ${pack.characterBible.age}`,
    `- **Gender:** ${pack.characterBible.gender}`,
    `- **Hair:** ${pack.characterBible.hair}`,
    `- **Clothes:** ${pack.characterBible.clothes}`,
    `- **Personality:** ${pack.characterBible.personality}`,
    `- **Consistency Notes:** ${pack.characterBible.consistencyNotes}`,
    "",
    "## Storyboard",
    ...pack.storyboard.flatMap((scene) => [
      "",
      `### Scene ${scene.sceneRange} - ${scene.beat}`,
      `**Timestamp:** ${scene.timestamp}`,
      "",
      `**Summary:** ${scene.summary}`,
      "",
      `**Camera:** ${scene.cameraAngle}`,
      "",
      `**Lighting:** ${scene.lighting}`,
      "",
      `**Emotion:** ${scene.emotion}`,
      "",
      `**Image Prompt:** ${scene.imagePrompt}`
    ]),
    "",
    "## Scene Prompts",
    ...pack.scenePrompts.flatMap((scene) => [
      "",
      `### Scene ${scene.sceneRange} - ${scene.beat}`,
      `**Timestamp:** ${scene.timestamp}`,
      "",
      `**Summary:** ${scene.summary}`,
      "",
      `**Camera:** ${scene.cameraAngle}`,
      "",
      `**Lighting:** ${scene.lighting}`,
      "",
      `**Emotion:** ${scene.emotion}`,
      "",
      `**Image Prompt:** ${scene.imagePrompt}`
    ]),
    ...(pack.thumbnail.prompt
      ? [
          "",
          "## Thumbnail",
          pack.thumbnail.prompt,
          "",
          `**Text Overlay:** ${pack.thumbnail.textOverlay}`,
          "",
          `**Composition Notes:** ${pack.thumbnail.compositionNotes}`
        ]
      : []),
    ...(pack.titles.length ? ["", "## Titles", ...pack.titles.map((title, index) => `${index + 1}. ${title}`)] : []),
    ...(pack.titlePack.curiosity.length
      ? ["", "## Title Pack", "### Curiosity", ...pack.titlePack.curiosity.map((title) => `- ${title}`), "### Fear", ...pack.titlePack.fear.map((title) => `- ${title}`), "### Question", ...pack.titlePack.question.map((title) => `- ${title}`), "### Clickbait", ...pack.titlePack.clickbait.map((title) => `- ${title}`)]
      : []),
    ...(pack.description ? ["", "## Description", pack.description] : []),
    ...(pack.hashtags.length ? ["", "## Hashtags", pack.hashtags.join(" ")] : []),
    ...(pack.keywords.length ? ["", "## Keywords", pack.keywords.join(", ")] : [])
  ].filter((line) => line !== undefined).join("\n");
}

export function exportAsCsv(pack: ContentPack) {
  const rows = [
    ["section", "label", "content"],
    ["summary", "Video Summary", pack.summary],
    ["character", "Character Bible", `${pack.characterBible.name} ${pack.characterBible.age} ${pack.characterBible.clothes}`],
    ...pack.storyboard.map((scene) => [
      "storyboard",
      `Scene ${scene.sceneRange} ${scene.beat}`,
      `${scene.summary} ${scene.cameraAngle} ${scene.lighting} ${scene.emotion} ${scene.imagePrompt}`
    ]),
    ...pack.scenePrompts.map((scene) => [
      "scene",
      `Scene ${scene.sceneRange} ${scene.beat} ${scene.timestamp}`,
      `${scene.summary} ${scene.cameraAngle} ${scene.lighting} ${scene.emotion} ${scene.imagePrompt}`
    ]),
    ...(pack.thumbnail.prompt ? [["thumbnail", "Thumbnail Prompt", pack.thumbnail.prompt]] : []),
    ...pack.titlePack.curiosity.map((title, index) => ["title", `Curiosity ${index + 1}`, title]),
    ...pack.titlePack.fear.map((title, index) => ["title", `Fear ${index + 1}`, title]),
    ...pack.titlePack.question.map((title, index) => ["title", `Question ${index + 1}`, title]),
    ...pack.titlePack.clickbait.map((title, index) => ["title", `Clickbait ${index + 1}`, title]),
    ...(pack.description ? [["description", "Description", pack.description]] : []),
    ...(pack.hashtags.length ? [["hashtags", "Hashtags", pack.hashtags.join(" ")]] : []),
    ...(pack.keywords.length ? [["keywords", "Keywords", pack.keywords.join(", ")]] : [])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
