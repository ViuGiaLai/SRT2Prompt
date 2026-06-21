import type { ImageStyle, OutputLanguage, SceneGrouping, VideoType } from "./types";

export const VIDEO_TYPES: VideoType[] = [
  "Horror Story",
  "Mystery Story",
  "Reddit Story",
  "Bedtime Story",
  "Educational",
  "Shorts",
  "Product Review"
];

export const IMAGE_STYLES: Array<{
  value: ImageStyle;
  description: string;
}> = [
  { value: "Dark Cinematic", description: "Moody, dramatic, high contrast visuals." },
  { value: "2D Minimal", description: "Clean, simple frames with clear subjects." },
  { value: "Semi Realistic", description: "Detailed scenes with grounded lighting." },
  { value: "Anime Inspired", description: "Expressive, polished illustrated visuals." },
  { value: "Comic Panel", description: "Bold composition with panel-like energy." },
  { value: "Children Book", description: "Soft, friendly storybook illustrations." }
];

export const OUTPUT_LANGUAGES: OutputLanguage[] = ["English", "Vietnamese", "Both"];

export const SCENE_GROUPINGS: SceneGrouping[] = ["Auto", "Short", "Medium", "Long"];
