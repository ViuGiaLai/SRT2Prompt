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
  description: string;
  hashtags: string[];
  keywords: string[];
};

export type GenerateOptions = {
  inputText: string;
  inputType?: InputType;
  videoType: VideoType;
  imageStyle: ImageStyle;
  language: OutputLanguage;
  sceneGrouping: SceneGrouping;
  includeThumbnail?: boolean;
  includeTitles?: boolean;
  includeDescription?: boolean;
  includeHashtags?: boolean;
  includeKeywords?: boolean;
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
