export type VideoType =
  | "Horror Story"
  | "Mystery Story"
  | "Reddit Story"
  | "Bedtime Story"
  | "Educational"
  | "Shorts"
  | "Product Review";

export type ImageStyle =
  | "Dark Cinematic"
  | "2D Minimal"
  | "Semi Realistic"
  | "Anime Inspired"
  | "Comic Panel"
  | "Children Book";

export type OutputLanguage = "English" | "Vietnamese" | "Both";

export type SceneGrouping = "Auto" | "Short" | "Medium" | "Long";

export type InputType = "srt" | "script";

export type PlanName = "Free" | "Creator" | "Pro";

export type UserSettings = {
  defaultVideoType: string;
  defaultImageStyle: string;
  youtubeChannelId: string;
  recentVideoTypes: string[];
  recentImageStyles: string[];
};

export type StoryBeat = "Opening" | "Build-up" | "Climax" | "Ending";

export type SubtitleLine = {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
};

export type SceneGroup = {
  sceneRange: string;
  timestamp: string;
  text: string;
  lines: SubtitleLine[];
};

export type ScenePrompt = {
  sceneRange: string;
  timestamp: string;
  beat: StoryBeat;
  summary: string;
  imagePrompt: string;
  cameraAngle: string;
  lighting: string;
  emotion: string;
};

export type CharacterBible = {
  name: string;
  age: string;
  gender: string;
  hair: string;
  clothes: string;
  personality: string;
  consistencyNotes: string;
};

export type TitlePack = {
  curiosity: string[];
  fear: string[];
  question: string[];
  clickbait: string[];
};

export type ViralScore = {
  seo: number;
  ctr: number;
  emotion: number;
  curiosity: number;
  competition: number;
  trend: number;
  overall: number;
  notes: string[];
};

export type KeywordPack = {
  primary: string;
  secondary: string[];
  longTail: string[];
};

export type CompetitorAnalysis = {
  name: string;
  titlePatterns: string[];
  thumbnailPatterns: string[];
  keywords: string[];
  uploadTime: string;
  descriptionPattern: string;
};

export type ImagePromptPreset = {
  flux: string;
  midjourney: string;
  chatgpt: string;
  leonardo: string;
  gemini: string;
};

export type SourceStatusState = "live" | "fallback" | "missing_key" | "error";

export type EngineSourceStatus = {
  youtubeData: SourceStatusState;
  youtubeSuggest: SourceStatusState;
  trends: SourceStatusState;
  notion: SourceStatusState;
  drive: SourceStatusState;
};

export type IntelligencePack = {
  storyType: string;
  storyEngine: {
    characters: string[];
    emotion: string;
    timeline: string[];
    structure: string;
  };
  sceneEngine: {
    beats: StoryBeat[];
    notes: string[];
  };
  characterMemory: CharacterBible;
  keywordPack: KeywordPack;
  descriptionEngine: {
    seoDensity: string;
    cta: string;
    timestampNote: string;
    hashtagPlacement: string;
  };
  hashtagEngine: {
    hashtags: string[];
    sourceNotes: string;
  };
  competitorEngine: CompetitorAnalysis[];
  viralScore: ViralScore;
  imagePromptPresets: ImagePromptPreset;
  apiHooks: string[];
  sourceStatus: EngineSourceStatus;
};

export type StoryboardScene = {
  sceneRange: string;
  timestamp: string;
  beat: StoryBeat;
  summary: string;
  imagePrompt: string;
  cameraAngle: string;
  lighting: string;
  emotion: string;
};

export type RegenerateSceneOptions = {
  scene: ScenePrompt;
  videoType: string;
  imageStyle: string;
  language: string;
};

export type ThumbnailPrompt = {
  prompt: string;
  textOverlay: string;
  compositionNotes: string;
};

export type ContentPack = {
  summary: string;
  videoType: VideoType | string;
  imageStyle: ImageStyle | string;
  language: OutputLanguage | string;
  characterBible: CharacterBible;
  scenePrompts: ScenePrompt[];
  storyboard: StoryboardScene[];
  thumbnail: ThumbnailPrompt;
  titles: string[];
  titlePack: TitlePack;
  intelligence: IntelligencePack;
  description: string;
  hashtags: string[];
  keywords: string[];
};

export type GenerateOptions = {
  inputText: string;
  inputType?: InputType;
  videoType: string;
  imageStyle: string;
  language: OutputLanguage;
  sceneGrouping: SceneGrouping;
  youtubeChannelId?: string;
  includeThumbnail?: boolean;
  includeTitles?: boolean;
  includeDescription?: boolean;
  includeHashtags?: boolean;
  includeKeywords?: boolean;
  variables?: Record<string, string>;
};

export type GenerationRecord = {
  id: string;
  userId: string;
  projectId?: string | null;
  summary: string;
  videoType: string;
  imageStyle: string;
  language: string;
  sceneCount: number;
  subtitleLines: number;
  status: "Completed" | "Failed" | "Draft";
  error?: string | null;
  createdAt: string;
};

export type PlanUsage = {
  plan: PlanName;
  dailyGenerations: number;
  monthlyGenerations: number;
  savedProjects: number;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  subtitleLineLimit: number | null;
  projectLimit: number | null;
};

export type BillingStatus = "active" | "trialing" | "past_due" | "canceled" | "pending";

export type BillingState = {
  userId: string;
  plan: PlanName;
  status: BillingStatus;
  priceLabel: string;
  nextBillingDate: string | null;
  provider: "lemon-squeezy";
  manageUrl?: string | null;
  updatedAt: string;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  inputText: string;
  inputType: InputType;
  videoType: string;
  imageStyle: string;
  language: string;
  sceneCount: number;
  contentPack: ContentPack;
  createdAt: string;
  updatedAt: string;
};
