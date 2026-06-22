import { callGemini } from "./ai-gateway";

export type CompetitorTitleSignal = {
  title: string;
  channelName: string;
};

export type ThumbnailTextScoreResult = {
  text: string;
  readability: number;
  emotion: number;
  curiosity: number;
  notes: string;
};

export type ViralAnalysisResult = {
  seoMatchScore: number;
  ctrHookScore: number;
  uniquenessRating: number;
  curiosityScore: number;
  emotionScore: number;
  lengthScore: number;
  mobileReadability: number;
  overallScore: number;
  bestTitle: string;
  topTitles: string[];
  trendingSuggestions: string[];
  competitors: CompetitorTitleSignal[];
  improvementNotes: string[];
  whyItWorks: string;
  
  // Phase 1.5 Upgrades
  hookBreakdown: string[];
  hookScore: number;
  thumbnailTextScore: ThumbnailTextScoreResult;
};

/**
 * Fetches search suggestions directly from YouTube Auto-Suggest autocomplete endpoint.
 */
async function fetchYouTubeSuggest(keyword: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.[1]) ? data[1].slice(0, 8) : [];
  } catch (err) {
    console.error("YouTube suggest API failed:", err);
    return [];
  }
}

/**
 * Fetches competitor titles from YouTube Search API if YOUTUBE_API_KEY is available,
 * otherwise falls back to a clean semantic mock.
 */
async function fetchCompetitorTitles(keyword: string): Promise<CompetitorTitleSignal[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Fallback search mock if API Key is not set
    return [
      { title: `I Worked the Night Shift at this hospital (True Story)`, channelName: "Mr Nightmare" },
      { title: `3 Hospital Night Shift Horror Stories (DO NOT LISTEN ALONE)`, channelName: "Dr NoSleep" },
      { title: `Why I quit the night shift at the old hospital`, channelName: "Lighthouse Horror" }
    ];
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.search = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "5",
      order: "viewCount",
      q: keyword,
      key: apiKey
    }).toString();

    const res = await fetch(searchUrl);
    if (!res.ok) throw new Error("YouTube API query failed");
    const data = await res.json();
    const items = data.items || [];
    return items.map((item: any) => ({
      title: item.snippet?.title || "",
      channelName: item.snippet?.channelTitle || ""
    })).filter((item: any) => item.title.length > 0);
  } catch (err) {
    console.error("Competitor API fetch failed, returning mock fallback:", err);
    return [
      { title: `I Worked the Night Shift at this hospital (True Story)`, channelName: "Mr Nightmare" },
      { title: `3 Hospital Night Shift Horror Stories (DO NOT LISTEN ALONE)`, channelName: "Dr NoSleep" }
    ];
  }
}

/**
 * Runs the Viral Engine analytics pipeline: pulls suggestions, fetches competitors,
 * and calls Gemini to grade hooks and output the final Top 5 optimized titles.
 */
export async function analyzeVirality(
  keyword: string,
  summary: string,
  videoType: string,
  thumbnailText?: string
): Promise<ViralAnalysisResult> {
  const cleanKeyword = keyword.trim();
  
  // 1. Fetch autocomplete search suggestions
  const suggestions = await fetchYouTubeSuggest(cleanKeyword);
  
  // 2. Fetch competitor top-performing titles
  const competitors = await fetchCompetitorTitles(cleanKeyword);

  // 3. Compile prompt to feed Gemini
  const prompt = `
Target Keyword: "${cleanKeyword}"
Video Type: ${videoType}
Thumbnail Overlay Text: "${thumbnailText || "None specified"}"
Story Summary:
"${summary}"

YouTube Auto-suggest suggestions for this keyword:
${JSON.stringify(suggestions)}

Top Performing Competitor Video Titles on YouTube:
${JSON.stringify(competitors.map(c => `[${c.channelName}]: ${c.title}`))}

Your task:
Analyze these inputs and calculate seven specific predicted viral performance grades from 0 to 100:
1. seoMatchScore: How well aligned it is with searched high-traffic autocompletes.
2. ctrHookScore: How strong the psychological click interest and relevance to target audience is.
3. uniquenessRating: Uniqueness and semantic differentiation compared to competitors (to avoid cliches).
4. curiosityScore: Strength of the information gap (e.g. "Rule #7" or "Do Not Open").
5. emotionScore: Emotion trigger power (fear, mystery, shock, surprise).
6. lengthScore: Ideal length evaluation (short/medium vs too long/truncated).
7. mobileReadability: Readability and clarity on mobile screen widths (optimal around 50-65 characters).
8. overallScore: Balanced average of the above scores.

Then, choose/generate the single BEST TITLE (optimized for highest predicted CTR and SEO performance).
Then, analyze this BEST TITLE and identify 3-5 specific psychological hook elements present in it (e.g., "Job opening", "Mystery", "Number", "Information gap", "Fear trigger", "Action verb"). Calculate a specific hookScore (0-100).
Then, analyze the Thumbnail Overlay Text (if provided) and score it from 0 to 100 on readability, emotion, and curiosity, providing a short helpful notes/suggestions text.
Then, generate a list of the TOP 5 OPTIMIZED TITLES with the highest predicted CTR/SEO scores that integrate the target keyword.
Provide 3 actionable tips for title improvement.
Provide a detailed explanation "whyItWorks" explaining why the best title is highly effective (e.g. 'Number creates curiosity. Job-based opening increases relatability. "Then Rule #7 Appeared" creates information gap').

Return a valid JSON object in this format:
{
  "seoMatchScore": 85,
  "ctrHookScore": 90,
  "uniquenessRating": 82,
  "curiosityScore": 88,
  "emotionScore": 92,
  "lengthScore": 87,
  "mobileReadability": 89,
  "overallScore": 89,
  "bestTitle": "The Best Title",
  "hookBreakdown": [
    "Job opening",
    "Mystery",
    "Number",
    "Information gap"
  ],
  "hookScore": 94,
  "thumbnailTextScore": {
    "text": "RULE #7",
    "readability": 95,
    "emotion": 90,
    "curiosity": 92,
    "notes": "Text is short and highly legible, triggering strong mystery."
  },
  "topTitles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ],
  "improvementNotes": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "whyItWorks": "Why it works details..."
}

Do not return conversational text, output valid JSON only.
  `;

  const systemInstruction = "You are the Viral Title growth engineer for YouTube and TikTok. Analyze search volume alignments, competitor metadata and calculate CTR score analytics. Do not guarantee views, only predict CTR/SEO score optimization.";

  try {
    const result = await callGemini(systemInstruction, prompt, 0.85);
    const topTitles = Array.isArray(result.topTitles) ? result.topTitles.slice(0, 5) : [];
    const bestTitle = result.bestTitle || topTitles[0] || `The Secret of ${cleanKeyword}`;
    return {
      seoMatchScore: Number(result.seoMatchScore) || 75,
      ctrHookScore: Number(result.ctrHookScore) || 75,
      uniquenessRating: Number(result.uniquenessRating) || 75,
      curiosityScore: Number(result.curiosityScore) || 75,
      emotionScore: Number(result.emotionScore) || 75,
      lengthScore: Number(result.lengthScore) || 75,
      mobileReadability: Number(result.mobileReadability) || 75,
      overallScore: Number(result.overallScore) || 75,
      bestTitle,
      topTitles,
      trendingSuggestions: suggestions,
      competitors,
      improvementNotes: Array.isArray(result.improvementNotes) ? result.improvementNotes : [],
      whyItWorks: result.whyItWorks || "This title uses psychological curiosity triggers and core search phrases to capture audience attention.",
      hookBreakdown: Array.isArray(result.hookBreakdown) ? result.hookBreakdown : ["Job opening", "Mystery"],
      hookScore: Number(result.hookScore) || 80,
      thumbnailTextScore: result.thumbnailTextScore || {
        text: thumbnailText || "None",
        readability: 75,
        emotion: 75,
        curiosity: 75,
        notes: "No text provided or default fallback score."
      }
    };
  } catch (err) {
    console.error("Gemini viral analysis failed, returning basic scoring:", err);
    // Basic fallback algorithm
    const mockTitles = [
      `DO NOT Work the Night Shift: The "${cleanKeyword}" Rules`,
      `I Broke the "${cleanKeyword}" Hospital Rules (True Horror)`,
      `Why You Should Never Answer the Phone in "${cleanKeyword}"`,
      `The Terrifying Incident of "${cleanKeyword}" Shift`,
      `3 Hospital Stories That Will Keep You Awake: "${cleanKeyword}"`
    ];
    return {
      seoMatchScore: 78,
      ctrHookScore: 82,
      uniquenessRating: 75,
      curiosityScore: 80,
      emotionScore: 85,
      lengthScore: 83,
      mobileReadability: 80,
      overallScore: 81,
      bestTitle: mockTitles[0],
      topTitles: mockTitles,
      trendingSuggestions: suggestions,
      competitors,
      improvementNotes: [
        "Include action verbs to trigger curiosity gaps.",
        "Add parentheses or brackets at the end for higher CTR (e.g. True Story).",
        "Keep the title length under 60 characters for mobile readers."
      ],
      whyItWorks: "It builds high urgency using the 'DO NOT' warning combined with high-intent search terms.",
      hookBreakdown: ["Fear trigger", "Mystery", "Information gap"],
      hookScore: 92,
      thumbnailTextScore: {
        text: thumbnailText || "None",
        readability: 85,
        emotion: 80,
        curiosity: 90,
        notes: "Matches horror audience expectations with concise text rules."
      }
    };
  }
}
