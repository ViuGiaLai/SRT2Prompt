import type { PlanName } from "./types";

export const PLAN_LIMITS: Record<PlanName, {
  dailyLimit: number | null;
  monthlyLimit: number | null;
  subtitleLineLimit: number | null;
  projectLimit: number | null;
  allowedStyles: string[];
  allowedLanguages: string[];
  titleLimit: number | null;
  exportFormats: Array<"txt" | "md" | "json" | "csv">;
  thumbnail: boolean;
  keywords: boolean;
}> = {
  Free: {
    dailyLimit: 3,
    monthlyLimit: null,
    subtitleLineLimit: 20,
    projectLimit: 3,
    allowedStyles: ["Dark Cinematic", "2D Minimal"],
    allowedLanguages: ["English", "Vietnamese"],
    titleLimit: 3,
    exportFormats: [],
    thumbnail: false,
    keywords: false
  },
  Creator: {
    dailyLimit: null,
    monthlyLimit: 100,
    subtitleLineLimit: 1000,
    projectLimit: null,
    allowedStyles: ["Dark Cinematic", "2D Minimal", "Semi Realistic", "Anime Inspired", "Comic Panel"],
    allowedLanguages: ["English", "Vietnamese", "Both"],
    titleLimit: 10,
    exportFormats: ["txt", "md"],
    thumbnail: true,
    keywords: true
  },
  Pro: {
    dailyLimit: null,
    monthlyLimit: null,
    subtitleLineLimit: null,
    projectLimit: null,
    allowedStyles: ["Dark Cinematic", "2D Minimal", "Semi Realistic", "Anime Inspired", "Comic Panel", "Children Book"],
    allowedLanguages: ["English", "Vietnamese", "Both"],
    titleLimit: null,
    exportFormats: ["txt", "md", "json", "csv"],
    thumbnail: true,
    keywords: true
  }
};
