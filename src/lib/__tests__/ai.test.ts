import { afterEach, describe, expect, it, vi } from "vitest";
import { generateContentPack } from "../ai";

describe("content generation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds a fallback pack when Gemini is unavailable", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("YOUTUBE_API_KEY", "");
    vi.stubEnv("NOTION_API_KEY", "");
    vi.stubEnv("GOOGLE_DRIVE_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_DRIVE_REFRESH_TOKEN", "");
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("suggestqueries.google.com")) {
          return jsonResponse(["", []]);
        }
        if (url.includes("trends.google.com")) {
          return textResponse(`)]}',\n{"default":{"trendingSearchesDays":[]}}`);
        }
        return jsonResponse({});
      })
    );

    const pack = await generateContentPack({
      inputText: `1
00:00:01,000 --> 00:00:04,000
He walked into the room.

2
00:00:05,000 --> 00:00:08,000
Something felt wrong.`,
      inputType: "srt",
      videoType: "Horror Story",
      imageStyle: "Dark Cinematic",
      language: "English",
      sceneGrouping: "Short"
    });

    expect(pack.storyboard.length).toBeGreaterThan(0);
    expect(pack.intelligence.sourceStatus.youtubeData).toBe("missing_key");
    expect(pack.intelligence.sourceStatus.youtubeSuggest).toBe("fallback");
    expect(pack.intelligence.sourceStatus.notion).toBe("missing_key");
    expect(pack.intelligence.viralScore.overall).toBeGreaterThan(0);
  });
});

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body)
  } as Response;
}

function textResponse(text: string) {
  return {
    ok: true,
    json: async () => JSON.parse(text.replace(/^\)\]\}',\n/, "")),
    text: async () => text
  } as Response;
}
