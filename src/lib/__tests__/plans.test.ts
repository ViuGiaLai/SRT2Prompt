import { describe, expect, it } from "vitest";
import { assertCanGenerate, normalizePackForPlan } from "../plans";
import type { ContentPack, PlanUsage } from "../types";

const basePack: ContentPack = {
  summary: "Sample summary",
  videoType: "Horror Story",
  imageStyle: "Dark Cinematic",
  language: "English",
  characterBible: {
    name: "Main Character",
    age: "Adult",
    gender: "Unspecified",
    hair: "Dark hair",
    clothes: "Dark jacket",
    personality: "Determined",
    consistencyNotes: "Keep face and outfit stable."
  },
  scenePrompts: [],
  storyboard: [],
  thumbnail: {
    prompt: "Thumbnail prompt",
    textOverlay: "Text overlay",
    compositionNotes: "Composition"
  },
  titles: ["Title A", "Title B", "Title C", "Title D"],
  titlePack: {
    curiosity: ["C1", "C2", "C3", "C4"],
    fear: ["F1", "F2", "F3", "F4"],
    question: ["Q1", "Q2", "Q3", "Q4"],
    clickbait: ["K1", "K2", "K3", "K4"]
  },
  intelligence: {
    storyType: "Story",
    storyEngine: {
      characters: ["Main Character"],
      emotion: "Tense",
      timeline: ["Start", "End"],
      structure: "Opening -> Ending"
    },
    sceneEngine: {
      beats: ["Opening", "Ending"],
      notes: ["Scene note"]
    },
    characterMemory: {
      name: "Main Character",
      age: "Adult",
      gender: "Unspecified",
      hair: "Dark hair",
      clothes: "Dark jacket",
      personality: "Determined",
      consistencyNotes: "Keep face and outfit stable."
    },
    keywordPack: {
      primary: "horror story",
      secondary: ["ghost story", "scary story"],
      longTail: ["best horror story prompt", "cinematic scary story prompt"]
    },
    descriptionEngine: {
      seoDensity: "High",
      cta: "Watch now",
      timestampNote: "Add timestamps",
      hashtagPlacement: "Bottom"
    },
    hashtagEngine: {
      hashtags: ["#horror"],
      sourceNotes: "Generated"
    },
    competitorEngine: [],
    viralScore: {
      seo: 70,
      ctr: 72,
      emotion: 75,
      curiosity: 80,
      competition: 55,
      trend: 60,
      overall: 69,
      notes: ["Base score"]
    },
    imagePromptPresets: {
      flux: "Flux prompt",
      midjourney: "MJ prompt",
      chatgpt: "ChatGPT prompt",
      leonardo: "Leonardo prompt",
      gemini: "Gemini prompt"
    },
    apiHooks: ["Gemini"],
    sourceStatus: {
      youtubeData: "missing_key",
      youtubeSuggest: "fallback",
      trends: "fallback",
      notion: "missing_key",
      drive: "missing_key"
    }
  },
  description: "Description",
  hashtags: ["#horror"],
  keywords: ["horror", "story"]
};

describe("plan helpers", () => {
  it("caps content by Free plan limits", () => {
    const pack = normalizePackForPlan(basePack, "Free");
    expect(pack.thumbnail.prompt).toBe("");
    expect(pack.keywords).toEqual([]);
    expect(pack.titles).toHaveLength(3);
    expect(pack.titlePack?.curiosity).toHaveLength(1);
  });

  it("blocks generation when limits are exceeded", () => {
    const usage: PlanUsage = {
      plan: "Free",
      dailyGenerations: 3,
      monthlyGenerations: 0,
      savedProjects: 0,
      dailyLimit: 3,
      monthlyLimit: null,
      subtitleLineLimit: 20,
      projectLimit: 3
    };

    expect(() => assertCanGenerate(usage, { subtitleLines: 10, imageStyle: "Dark Cinematic", language: "English" })).toThrow(/Free limit reached/);
  });
});
