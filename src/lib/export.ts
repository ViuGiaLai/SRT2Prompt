import type { ContentPack } from "./types";

export function exportAsText(pack: ContentPack) {
  return [
    "VIDEO SUMMARY",
    pack.summary,
    "",
    "SCENE PROMPTS",
    ...pack.scenePrompts.flatMap((scene) => [
      "",
      `Scene ${scene.sceneRange}`,
      scene.timestamp,
      `Summary: ${scene.summary}`,
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
    "## Scene Prompts",
    ...pack.scenePrompts.flatMap((scene) => [
      "",
      `### Scene ${scene.sceneRange}`,
      `**Timestamp:** ${scene.timestamp}`,
      "",
      `**Summary:** ${scene.summary}`,
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
    ...(pack.description ? ["", "## Description", pack.description] : []),
    ...(pack.hashtags.length ? ["", "## Hashtags", pack.hashtags.join(" ")] : []),
    ...(pack.keywords.length ? ["", "## Keywords", pack.keywords.join(", ")] : [])
  ].filter((line) => line !== undefined).join("\n");
}

export function exportAsCsv(pack: ContentPack) {
  const rows = [
    ["section", "label", "content"],
    ["summary", "Video Summary", pack.summary],
    ...pack.scenePrompts.map((scene) => [
      "scene",
      `Scene ${scene.sceneRange} ${scene.timestamp}`,
      `${scene.summary} ${scene.imagePrompt}`
    ]),
    ...(pack.thumbnail.prompt ? [["thumbnail", "Thumbnail Prompt", pack.thumbnail.prompt]] : []),
    ...pack.titles.map((title, index) => ["title", `Title ${index + 1}`, title]),
    ...(pack.description ? [["description", "Description", pack.description]] : []),
    ...(pack.hashtags.length ? [["hashtags", "Hashtags", pack.hashtags.join(" ")]] : []),
    ...(pack.keywords.length ? [["keywords", "Keywords", pack.keywords.join(", ")]] : [])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
