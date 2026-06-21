import SrtParser2 from "srt-parser-2";
import type { InputType, SceneGrouping, SceneGroup, SubtitleLine } from "./types";

const TIMESTAMP_PATTERN = /\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}/;

export function detectInputType(inputText: string): InputType {
  return TIMESTAMP_PATTERN.test(inputText) ? "srt" : "script";
}

export function parseSrt(inputText: string): SubtitleLine[] {
  try {
    const parser = new SrtParser2();
    return parser
      .fromSrt(inputText)
      .map((entry) => ({
        id: String(entry.id),
        startTime: entry.startTime,
        endTime: entry.endTime,
        text: entry.text.replace(/\s+/g, " ").trim()
      }))
      .filter((entry) => entry.text.length > 0);
  } catch {
    return parseSrtFallback(inputText);
  }
}

function parseSrtFallback(inputText: string): SubtitleLine[] {
  return inputText
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const timestampIndex = lines.findIndex((line) => TIMESTAMP_PATTERN.test(line));
      if (timestampIndex === -1) return null;
      const [startTime, endTime] = lines[timestampIndex].split(/\s+-->\s+/);
      const id = timestampIndex > 0 ? lines[0] : String(index + 1);
      const text = lines.slice(timestampIndex + 1).join(" ").replace(/\s+/g, " ").trim();
      if (!text) return null;
      return { id, startTime, endTime, text };
    })
    .filter((entry): entry is SubtitleLine => Boolean(entry));
}

export function scriptToPseudoLines(inputText: string): SubtitleLine[] {
  const chunks = inputText
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((text, index) => ({
    id: String(index + 1),
    startTime: "",
    endTime: "",
    text
  }));
}

export function getSubtitleLines(inputText: string, inputType = detectInputType(inputText)) {
  return inputType === "srt" ? parseSrt(inputText) : scriptToPseudoLines(inputText);
}

export function groupScenes(lines: SubtitleLine[], grouping: SceneGrouping): SceneGroup[] {
  if (lines.length === 0) return [];

  const size = getGroupSize(lines.length, grouping);
  const groups: SceneGroup[] = [];

  for (let index = 0; index < lines.length; index += size) {
    const groupLines = lines.slice(index, index + size);
    const first = groupLines[0];
    const last = groupLines[groupLines.length - 1];
    const sceneRange = first.id === last.id ? first.id : `${first.id}-${last.id}`;
    const timestamp =
      first.startTime && last.endTime ? `${first.startTime} --> ${last.endTime}` : "Script segment";

    groups.push({
      sceneRange,
      timestamp,
      text: groupLines.map((line) => line.text).join(" "),
      lines: groupLines
    });
  }

  return groups;
}

function getGroupSize(totalLines: number, grouping: SceneGrouping) {
  if (grouping === "Short") return 3;
  if (grouping === "Medium") return 6;
  if (grouping === "Long") return 10;
  if (totalLines <= 12) return 3;
  if (totalLines <= 50) return 5;
  return 8;
}

export function getInputStats(inputText: string, grouping: SceneGrouping) {
  const inputType = detectInputType(inputText);
  const lines = getSubtitleLines(inputText, inputType);
  const scenes = groupScenes(lines, grouping);

  return {
    inputType,
    characterCount: inputText.length,
    subtitleLines: lines.length,
    estimatedScenes: scenes.length,
    scenes
  };
}
