"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  FileUp,
  Loader2,
  Save,
  Sparkles,
  Play,
  FileText,
  BookOpen,
  Film,
  Search,
  Image,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { IMAGE_STYLES, OUTPUT_LANGUAGES, SCENE_GROUPINGS, VIDEO_TYPES } from "@/src/lib/constants";
import { PLAN_LIMITS } from "@/src/lib/plan-config";
import type { ContentPack, GenerateOptions, OutputLanguage, PlanUsage, SceneGrouping, ScenePrompt, CharacterBible, ThumbnailPrompt } from "@/src/lib/types";
import { OutputTabs } from "./OutputTabs";

// React Flow Imports
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const sampleSrt = `1
00:00:00,000 --> 00:00:05,000
I worked the night shift at an old hospital.

2
00:00:05,000 --> 00:00:10,000
My boss gave me a strange list of rules.

3
00:00:10,000 --> 00:00:16,000
The first rule said never answer the phone after midnight.`;

function cleanErrorMessage(message: string): string {
  const lowercase = message.toLowerCase();
  if (lowercase.includes("quota exceeded") || lowercase.includes("quota") || lowercase.includes("rate limit") || lowercase.includes("429")) {
    return "Tài khoản của bạn tạm thời vượt quá giới hạn lượt gọi Gemini API miễn phí (Rate Limit). Vui lòng đợi khoảng 1 phút rồi bấm chạy lại (Regen / Run).";
  }
  return message;
}

type Stats = {
  inputType: string;
  characterCount: number;
  subtitleLines: number;
  estimatedScenes: number;
};

type OutputOption = "includeThumbnail" | "includeTitles" | "includeDescription" | "includeHashtags" | "includeKeywords";

const outputOptions: Array<{ key: OutputOption; label: string }> = [
  { key: "includeThumbnail", label: "Generate thumbnail prompt" },
  { key: "includeTitles", label: "Generate YouTube titles" },
  { key: "includeDescription", label: "Generate description" },
  { key: "includeHashtags", label: "Generate hashtags" },
  { key: "includeKeywords", label: "Generate keywords" }
];

type NodeStatus = "idle" | "generating" | "completed" | "error" | "out_of_sync";

// Custom Node Component for React Flow
function WorkflowNode({
  data
}: {
  data: {
    label: string;
    description: string;
    icon: any;
    status: NodeStatus;
    onRun: () => void;
    canRun: boolean;
  };
}) {
  const Icon = data.icon;
  const statusLabel = {
    idle: "Idle",
    generating: "Running...",
    completed: "Ready",
    out_of_sync: "Outdated",
    error: "Error"
  };

  return (
    <div className={`relative px-4 py-3 rounded-lg border bg-panel transition-all min-w-[200px] shadow-lg ${
      data.status === "generating" ? "border-accent ring-1 ring-accent animate-pulse" :
      data.status === "completed" ? "border-success bg-success/5" :
      data.status === "out_of_sync" ? "border-warning bg-warning/5" : "border-line bg-panelSoft/50"
    }`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-accent" />
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${
          data.status === "completed" ? "bg-success/15 text-success" :
          data.status === "generating" ? "bg-accent/15 text-accent animate-spin" :
          data.status === "out_of_sync" ? "bg-warning/15 text-warning" : "bg-panelSoft text-muted"
        }`}>
          {Icon && <Icon size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-fg truncate">{data.label}</div>
          <div className="text-[10px] text-muted truncate mt-0.5">{data.description}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/50 pt-2 text-[10px]">
        <div className="flex items-center gap-1 font-medium">
          <span className={`h-1.5 w-1.5 rounded-full ${
            data.status === "completed" ? "bg-success" :
            data.status === "generating" ? "bg-accent animate-ping" :
            data.status === "out_of_sync" ? "bg-warning" : "bg-muted"
          }`} />
          <span className={`uppercase tracking-wider ${
            data.status === "completed" ? "text-success" :
            data.status === "generating" ? "text-accent" :
            data.status === "out_of_sync" ? "text-warning" : "text-muted"
          }`}>
            {statusLabel[data.status]}
          </span>
        </div>

        {data.onRun && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              Promise.resolve(data.onRun()).catch((err) => {
                console.error("Workflow node execution failed:", err);
              });
            }}
            disabled={!data.canRun || data.status === "generating"}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition ${
              data.status === "generating"
                ? "bg-accent/25 text-accent cursor-not-allowed"
                : "bg-accent hover:bg-accent-strong text-white"
            }`}
          >
            {data.status === "generating" ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
            {data.status === "completed" ? "Regen" : "Run"}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-accent" />
    </div>
  );
}

const nodeTypes = {
  workflowNode: WorkflowNode
};

const FRIENDLY_LABELS: Record<string, string> = {
  platform: "Platform",
  target_audience: "Audience",
  tone: "Tone",
  narrator_style: "Narrator style"
};

function getFriendlyLabel(key: string): string {
  if (FRIENDLY_LABELS[key]) return FRIENDLY_LABELS[key];
  return key
    .split(/[-_]/)
    .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
}

export function GeneratorWorkspace({
  usage,
  initialVideoType,
  initialImageStyle,
  recentVideoTypes,
  recentImageStyles
}: {
  usage: PlanUsage;
  initialVideoType: string;
  initialImageStyle: string;
  recentVideoTypes: string[];
  recentImageStyles: string[];
}) {
  const planLimits = PLAN_LIMITS[usage.plan];
  const [inputText, setInputText] = useState(sampleSrt);
  const [videoType, setVideoType] = useState(initialVideoType);
  const [imageStyle, setImageStyle] = useState(initialImageStyle);
  const [customImageStyle, setCustomImageStyle] = useState("");
  const [language, setLanguage] = useState<OutputLanguage>("English");
  const [sceneGrouping, setSceneGrouping] = useState<SceneGrouping>("Auto");
  const [pack, setPack] = useState<ContentPack | null>(null);

  // Prompt Variables (Dify variable system)
  const [variables, setVariables] = useState<Record<string, string>>({
    platform: "YouTube",
    target_audience: "horror stories audience",
    tone: "spooky & suspenseful",
    narrator_style: "deep narrator voice"
  });

  const [selectedOutputs, setSelectedOutputs] = useState<Record<OutputOption, boolean>>({
    includeThumbnail: planLimits.thumbnail,
    includeTitles: true,
    includeDescription: true,
    includeHashtags: true,
    includeKeywords: planLimits.keywords
  });
  const [stats, setStats] = useState<Stats>({
    inputType: "srt",
    characterCount: sampleSrt.length,
    subtitleLines: 3,
    estimatedScenes: 1
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const outputPaneRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [extensionDetected, setExtensionDetected] = useState(false);

  // Workflow node status states
  const [storyStatus, setStoryStatus] = useState<NodeStatus>("idle");
  const [scenesStatus, setScenesStatus] = useState<NodeStatus>("idle");
  const [seoStatus, setSeoStatus] = useState<NodeStatus>("idle");
  const [thumbnailStatus, setThumbnailStatus] = useState<NodeStatus>("idle");

  const [activeTab, setActiveTab] = useState<string>("Overview");

  const canGenerate = useMemo(() => inputText.trim().length >= 10 && !loading, [inputText, loading]);
  const usageLabel =
    usage.dailyLimit !== null
      ? `${usage.dailyGenerations} / ${usage.dailyLimit} generations today`
      : usage.monthlyLimit !== null
        ? `${usage.monthlyGenerations} / ${usage.monthlyLimit} generations this month`
        : "Unlimited generations";

  useEffect(() => {
    if (!loading) return;
    requestAnimationFrame(() => {
      outputPaneRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }, [loading]);

  useEffect(() => {
    if (!error && !notice) return;
    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  }, [error, notice]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeout: number | undefined;
    let interval: number | undefined;

    const handler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type === "TAO_ANH_AI_PONG") {
        setExtensionDetected(true);
        if (timeout) window.clearTimeout(timeout);
      }
    };

    window.addEventListener("message", handler);

    const ping = () => {
      window.postMessage({ type: "TAO_ANH_AI_PING" }, window.location.origin);
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setExtensionDetected(false), 1200);
    };

    ping();
    interval = window.setInterval(ping, 5000);

    return () => {
      window.removeEventListener("message", handler);
      if (timeout) window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  // Derive workflow node statuses when pack changes (e.g. on project load)
  useEffect(() => {
    if (pack) {
      const hasStory = !!pack.summary && !!pack.characterBible?.name;
      const hasScenes = pack.scenePrompts?.length > 0 && pack.scenePrompts.some(s => !!s.imagePrompt);
      const hasSeo = pack.titles?.length > 0 && !!pack.description;
      const hasThumbnail = !!pack.thumbnail?.prompt;

      setStoryStatus(hasStory ? "completed" : "idle");
      setScenesStatus(hasScenes ? "completed" : hasStory ? "out_of_sync" : "idle");
      setSeoStatus(hasSeo ? "completed" : hasStory ? "out_of_sync" : "idle");
      setThumbnailStatus(hasThumbnail ? "completed" : hasStory ? "out_of_sync" : "idle");
    } else {
      setStoryStatus("idle");
      setScenesStatus("idle");
      setSeoStatus("idle");
      setThumbnailStatus("idle");
    }
  }, [pack]);

  async function refreshStats(nextText = inputText, nextGrouping = sceneGrouping) {
    const response = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputText: nextText, sceneGrouping: nextGrouping })
    });
    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  }

  async function handleInputChange(value: string) {
    setInputText(value);
    setError("");
    // Invalidate node statuses
    setStoryStatus("idle");
    setScenesStatus("idle");
    setSeoStatus("idle");
    setThumbnailStatus("idle");
    await refreshStats(value);
  }

  async function handleGroupingChange(value: SceneGrouping) {
    setSceneGrouping(value);
    setStoryStatus("idle");
    setScenesStatus("idle");
    setSeoStatus("idle");
    setThumbnailStatus("idle");
    await refreshStats(inputText, value);
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".srt") && !name.endsWith(".txt")) {
      setError("Please upload a .srt or .txt file.");
      return;
    }
    const text = await file.text();
    await handleInputChange(text);
  }

  // --- Step 1: Run Story Node ---
  async function runStoryNode() {
    setStoryStatus("generating");
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/generate/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          videoType,
          imageStyle: customImageStyle.trim() || imageStyle,
          language,
          sceneGrouping,
          variables
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Story generation failed.");

      setPack((prev) => {
        const base = prev || {
          summary: "",
          videoType,
          imageStyle: customImageStyle.trim() || imageStyle,
          language,
          characterBible: { name: "", age: "", gender: "", hair: "", clothes: "", personality: "", consistencyNotes: "" },
          scenePrompts: [],
          storyboard: [],
          thumbnail: { prompt: "", textOverlay: "", compositionNotes: "" },
          titles: [],
          titlePack: { curiosity: [], fear: [], question: [], clickbait: [] },
          intelligence: {
            storyType: "",
            storyEngine: { characters: [], emotion: "", timeline: [], structure: "" },
            sceneEngine: { beats: [], notes: [] },
            characterMemory: { name: "", age: "", gender: "", hair: "", clothes: "", personality: "", consistencyNotes: "" },
            keywordPack: { primary: "", secondary: [], longTail: [] },
            descriptionEngine: { seoDensity: "", cta: "", timestampNote: "", hashtagPlacement: "" },
            hashtagEngine: { hashtags: [], sourceNotes: "" },
            competitorEngine: [],
            viralScore: { seo: 0, ctr: 0, emotion: 0, curiosity: 0, competition: 0, trend: 0, overall: 0, notes: [] },
            imagePromptPresets: { flux: "", midjourney: "", chatgpt: "", leonardo: "", gemini: "" },
            apiHooks: [],
            sourceStatus: { youtubeData: "missing_key", youtubeSuggest: "missing_key", trends: "missing_key", notion: "missing_key", drive: "missing_key" }
          },
          description: "",
          hashtags: [],
          keywords: []
        };

        // Initialize empty placeholder scene prompts matching the story beats
        const timelineScenes = data.timeline.map((item: any) => ({
          sceneRange: item.sceneRange,
          timestamp: item.timestamp,
          beat: item.beat || "Opening",
          summary: item.text || item.summary || "",
          imagePrompt: "",
          cameraAngle: "",
          lighting: "",
          emotion: ""
        }));

        return {
          ...base,
          summary: data.summary,
          characterBible: data.characterBible,
          scenePrompts: timelineScenes,
          storyboard: timelineScenes
        };
      });

      setStoryStatus("completed");
      // Set subsequent nodes to out_of_sync
      setScenesStatus("out_of_sync");
      setSeoStatus("out_of_sync");
      setThumbnailStatus("out_of_sync");
      setActiveTab("Overview");
      return data;
    } catch (err) {
      setStoryStatus("error");
      setError(cleanErrorMessage(err instanceof Error ? err.message : "Story node failed."));
      throw err;
    }
  }

  // --- Step 2: Run Scenes Node ---
  async function runScenesNode() {
    if (!pack || !pack.summary) {
      setError("Please run the Story Engine first.");
      return;
    }

    setScenesStatus("generating");
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/generate/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType,
          imageStyle: customImageStyle.trim() || imageStyle,
          language,
          summary: pack.summary,
          characterBible: pack.characterBible,
          scenes: pack.scenePrompts,
          variables
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scenes generation failed.");

      setPack((prev) => ({
        ...prev!,
        scenePrompts: data.scenePrompts,
        storyboard: data.storyboard
      }));

      setScenesStatus("completed");
      setActiveTab("Scene Prompts");
      return data;
    } catch (err) {
      setScenesStatus("error");
      setError(cleanErrorMessage(err instanceof Error ? err.message : "Scenes node failed."));
      throw err;
    }
  }

  // --- Step 3: Run SEO Node ---
  async function runSeoNode() {
    if (!pack || !pack.summary) {
      setError("Please run the Story Engine first.");
      return;
    }

    setSeoStatus("generating");
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/generate/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType,
          language,
          summary: pack.summary,
          keywords: pack.keywords,
          variables
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "SEO generation failed.");

      setPack((prev) => ({
        ...prev!,
        titles: data.titles,
        titlePack: data.titlePack,
        description: data.description,
        hashtags: data.hashtags,
        keywords: data.keywords,
        intelligence: {
          ...prev!.intelligence,
          viralScore: data.viralScore,
          sourceStatus: data.sourceStatus || prev!.intelligence.sourceStatus
        }
      }));

      setSeoStatus("completed");
      // Thumbnail creator depends on top title, so flag out of sync
      setThumbnailStatus("out_of_sync");
      setActiveTab("Titles");
      return data;
    } catch (err) {
      setSeoStatus("error");
      setError(cleanErrorMessage(err instanceof Error ? err.message : "SEO node failed."));
      throw err;
    }
  }

  // --- Step 4: Run Thumbnail Node ---
  async function runThumbnailNode() {
    if (!pack || !pack.summary) {
      setError("Please run the Story Engine first.");
      return;
    }

    setThumbnailStatus("generating");
    setError("");
    setNotice("");

    const bestTitle = pack.titles?.[0] || "Untitled Video";

    try {
      const response = await fetch("/api/generate/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType,
          imageStyle: customImageStyle.trim() || imageStyle,
          language,
          summary: pack.summary,
          bestTitle,
          variables
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Thumbnail generation failed.");

      setPack((prev) => ({
        ...prev!,
        thumbnail: data.thumbnail
      }));

      setThumbnailStatus("completed");
      setActiveTab("Thumbnail");
      return data;
    } catch (err) {
      setThumbnailStatus("error");
      setError(cleanErrorMessage(err instanceof Error ? err.message : "Thumbnail node failed."));
      throw err;
    }
  }

  // Linear Pipeline Sequential Execution
  async function generate() {
    setLoading(true);
    setError("");
    setNotice("");
    setPack(null);

    try {
      // 1. Story Node
      const storyData = await runStoryNode();
      
      // 2. Scene Node
      if (selectedOutputs.includeThumbnail || selectedOutputs.includeTitles || selectedOutputs.includeDescription || selectedOutputs.includeHashtags || selectedOutputs.includeKeywords) {
        // Wait briefly for smooth visual edge animation
        await new Promise((r) => setTimeout(r, 600));
      }
      await runScenesNode();

      // 3. SEO Node
      await new Promise((r) => setTimeout(r, 600));
      await runSeoNode();

      // 4. Thumbnail Node
      if (selectedOutputs.includeThumbnail) {
        await new Promise((r) => setTimeout(r, 600));
        await runThumbnailNode();
      }

      setNotice("Content pack generated successfully via workflow pipeline.");
    } catch (err) {
      console.error(err);
      setError(cleanErrorMessage(err instanceof Error ? err.message : "Pipeline execution interrupted."));
    } finally {
      setLoading(false);
    }
  }

  async function saveProject() {
    if (!pack) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pack.titles?.[0] || "Untitled Content Pack",
          inputText,
          inputType: stats.inputType,
          videoType,
          imageStyle: customImageStyle.trim() || imageStyle,
          language,
          sceneCount: pack.scenePrompts?.length || 0,
          contentPack: pack
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save project.");
      setNotice("Project saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project.");
    } finally {
      setSaving(false);
    }
  }

  // --- React Flow Diagram Nodes & Edges Generation ---
  const nodes: Node[] = useMemo(() => {
    return [
      {
        id: "srtInput",
        type: "workflowNode",
        data: {
          label: "1. Subtitle & Script",
          description: stats.inputType === "srt" ? `${stats.subtitleLines} lines uploaded` : `${stats.characterCount} characters input`,
          icon: FileText,
          status: inputText.trim().length >= 10 ? "completed" : "idle",
          canRun: false
        },
        position: { x: 20, y: 80 }
      },
      {
        id: "storyEngine",
        type: "workflowNode",
        data: {
          label: "2. Story Engine",
          description: "Summary & Character Bible",
          icon: BookOpen,
          status: storyStatus,
          canRun: inputText.trim().length >= 10,
          onRun: runStoryNode
        },
        position: { x: 270, y: 80 }
      },
      {
        id: "sceneGenerator",
        type: "workflowNode",
        data: {
          label: "3. Scene Generator",
          description: "Visual prompts & angles",
          icon: Film,
          status: scenesStatus,
          canRun: storyStatus === "completed",
          onRun: runScenesNode
        },
        position: { x: 520, y: 80 }
      },
      {
        id: "seoEngine",
        type: "workflowNode",
        data: {
          label: "4. SEO & Viral Engine",
          description: "Engaging titles & tags",
          icon: Search,
          status: seoStatus,
          canRun: storyStatus === "completed",
          onRun: runSeoNode
        },
        position: { x: 770, y: 80 }
      },
      {
        id: "thumbnailCreator",
        type: "workflowNode",
        data: {
          label: "5. Thumbnail Creator",
          description: "Thumb direction & layout",
          icon: Image,
          status: thumbnailStatus,
          canRun: storyStatus === "completed" && seoStatus === "completed",
          onRun: runThumbnailNode
        },
        position: { x: 1020, y: 80 }
      }
    ];
  }, [inputText, stats, storyStatus, scenesStatus, seoStatus, thumbnailStatus, pack]);

  const edges: Edge[] = useMemo(() => {
    return [
      {
        id: "e-input-story",
        source: "srtInput",
        target: "storyEngine",
        animated: storyStatus === "generating",
        style: { stroke: storyStatus === "generating" ? "#8B5CF6" : "#374151", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: storyStatus === "generating" ? "#8B5CF6" : "#374151" }
      },
      {
        id: "e-story-scenes",
        source: "storyEngine",
        target: "sceneGenerator",
        animated: scenesStatus === "generating",
        style: { stroke: scenesStatus === "generating" ? "#8B5CF6" : scenesStatus === "out_of_sync" ? "#F59E0B" : "#374151", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: scenesStatus === "generating" ? "#8B5CF6" : scenesStatus === "out_of_sync" ? "#F59E0B" : "#374151" }
      },
      {
        id: "e-scenes-seo",
        source: "sceneGenerator",
        target: "seoEngine",
        animated: seoStatus === "generating",
        style: { stroke: seoStatus === "generating" ? "#8B5CF6" : seoStatus === "out_of_sync" ? "#F59E0B" : "#374151", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: seoStatus === "generating" ? "#8B5CF6" : seoStatus === "out_of_sync" ? "#F59E0B" : "#374151" }
      },
      {
        id: "e-seo-thumb",
        source: "seoEngine",
        target: "thumbnailCreator",
        animated: thumbnailStatus === "generating",
        style: { stroke: thumbnailStatus === "generating" ? "#8B5CF6" : thumbnailStatus === "out_of_sync" ? "#F59E0B" : "#374151", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: thumbnailStatus === "generating" ? "#8B5CF6" : thumbnailStatus === "out_of_sync" ? "#F59E0B" : "#374151" }
      }
    ];
  }, [storyStatus, scenesStatus, seoStatus, thumbnailStatus]);

  // Handle flow chart click to change preview tab below
  const onNodeClick = (_e: any, node: any) => {
    const tabMap: Record<string, string> = {
      srtInput: "Overview",
      storyEngine: "Character Bible",
      sceneGenerator: "Scene Prompts",
      seoEngine: "Titles",
      thumbnailCreator: "Thumbnail"
    };
    if (tabMap[node.id]) {
      setActiveTab(tabMap[node.id]);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
      <div className="space-y-5">
        <Panel className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm text-muted">Current plan</div>
            <div className="text-xl font-semibold">{usage.plan}</div>
          </div>
          <div className="text-sm text-muted">{usageLabel}</div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Create Content Pack</h1>
              <p className="mt-1 text-sm text-muted">Paste SRT/script or upload a subtitle file.</p>
            </div>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-panelSoft px-3 text-sm text-fg hover:border-accent">
              <FileUp size={16} />
              Upload SRT/TXT
              <input type="file" accept=".srt,.txt,text/plain" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={(event) => void handleInputChange(event.target.value)}
            placeholder="Paste your SRT or script here..."
            className="min-h-[220px] w-full resize-y rounded-md border border-line bg-panelSoft p-4 text-sm leading-6 text-fg focus-ring"
          />

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
            <Stat label="Characters" value={stats.characterCount} />
            <Stat label="Subtitle lines" value={stats.subtitleLines} />
            <Stat label="Estimated scenes" value={stats.estimatedScenes} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-semibold">Settings</h2>
          <div className="space-y-5">
            <Field label="Video Type">
              <input
                value={videoType}
                onChange={(event) => setVideoType(event.target.value)}
                list="video-type-options"
                className="h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
                placeholder="Type or choose a video type"
              />
              <datalist id="video-type-options">
                {VIDEO_TYPES.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>

            <Field label="Image Style">
              <select
                value={imageStyle}
                onChange={(event) => setImageStyle(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
              >
                {IMAGE_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.value}
                  </option>
                ))}
              </select>
              <input
                value={customImageStyle}
                onChange={(event) => setCustomImageStyle(event.target.value)}
                className="mt-3 h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
                placeholder="Optional custom image style"
              />
            </Field>

            <Field label="Output Language">
              <div className="flex flex-wrap gap-2">
                {OUTPUT_LANGUAGES.map((item) => {
                  const allowed = planLimits.allowedLanguages.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => allowed && setLanguage(item)}
                      disabled={!allowed}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        language === item ? "border-accent bg-accent text-white" : "border-line bg-panelSoft text-muted"
                      } ${!allowed ? "opacity-45" : ""}`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Scene Grouping">
              <select
                value={sceneGrouping}
                onChange={(event) => void handleGroupingChange(event.target.value as SceneGrouping)}
                className="h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
              >
                {SCENE_GROUPINGS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            {/* Variable System (Dify style) */}
            <div className="border-t border-line/50 pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-fg flex items-center gap-1.5">
                  <BookOpen size={16} className="text-accent" /> Prompt Variables
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Configure variables to customize system prompts for target channels.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-fg w-1/3 truncate text-muted">
                      {getFriendlyLabel(key)}:
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setVariables(prev => ({ ...prev, [key]: nextVal }));
                      }}
                      className="h-8 flex-1 rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                      placeholder={`Value for ${getFriendlyLabel(key).toLowerCase()}`}
                    />
                    {!["platform", "target_audience", "tone", "narrator_style"].includes(key) && (
                      <button
                        type="button"
                        onClick={() => {
                          setVariables(prev => {
                            const next = { ...prev };
                            delete next[key];
                            return next;
                          });
                        }}
                        className="text-xs text-danger hover:underline px-1 shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Variable Form */}
              <AddVariableForm onAdd={(key, val) => {
                setVariables(prev => ({ ...prev, [key]: val }));
              }} />
            </div>

            <div className="sticky bottom-16 z-10 flex flex-wrap gap-3 rounded-lg border border-line bg-panel/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
              <Button type="button" size="lg" disabled={!canGenerate} onClick={() => void generate()}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? "Generating..." : "Generate All Nodes"}
              </Button>
              <Button type="button" size="lg" variant="secondary" disabled={!pack || saving} onClick={() => void saveProject()}>
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Project"}
              </Button>
            </div>
            {(error || notice) && (
              <div ref={feedbackRef} className="mt-3 space-y-2">
                {error && (
                  <div className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-danger animate-shake">
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="rounded-md border border-success bg-success/10 p-3 text-sm text-success">
                    {notice}
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div ref={outputPaneRef} className="scroll-mt-24 flex flex-col space-y-5">
        {/* React Flow Panel */}
        <Panel className="p-0 border-line bg-panelSoft/20 overflow-hidden relative">
          <div className="px-4 py-2 border-b border-line bg-panelSoft/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-fg">Flowise Pipeline Workflow</span>
            </div>
            <div className="text-[10px] text-muted flex items-center gap-1">
              <RefreshCw size={10} /> Click a node to view its output tab below
            </div>
          </div>
          <div className="h-[230px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.5}
              maxZoom={1.5}
              nodesConnectable={false}
              nodesDraggable={true}
              elementsSelectable={true}
              panOnScroll={true}
              zoomOnDoubleClick={false}
            >
              <Background color="#374151" gap={16} size={1} />
              <Controls showInteractive={false} className="!bg-panel !border-line" />
            </ReactFlow>
          </div>
        </Panel>

        <div>
          {loading && !pack ? (
            <LoadingPanel />
          ) : (
            <OutputTabs
              pack={pack}
              plan={usage.plan}
              activeTab={activeTab}
              onActiveTabChange={(tab) => setActiveTab(tab)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-fg">{label}</div>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panelSoft p-3">
      <div>{label}</div>
      <div className="mt-1 text-base font-semibold text-fg">{value}</div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <Panel className="min-h-[400px] flex flex-col justify-center">
      <h2 className="text-xl font-semibold animate-pulse text-center">Pipeline running step-by-step...</h2>
      <div className="mt-6 space-y-4 max-w-md mx-auto w-full">
        {["Analyzing script beats", "Formulating consistent Character Bible", "Creating prompt directions", "Optimizing SEO Titles"].map((item) => (
          <div key={item} className="rounded-lg border border-line bg-panelSoft p-4">
            <div className="flex items-center gap-3 text-sm">
              <Loader2 className="animate-spin text-accent" size={16} />
              {item}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

interface AddVariableFormProps {
  onAdd: (key: string, val: string) => void;
}

function AddVariableForm({ onAdd }: AddVariableFormProps) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !val.trim()) return;
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanKey) return;
    onAdd(cleanKey, val.trim());
    setKey("");
    setVal("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-panelSoft/30 p-2.5 rounded border border-line/45">
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="h-8 w-24 rounded-md border border-line bg-panel px-2 text-xs focus-ring text-fg"
        placeholder="Field name"
        required
      />
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-8 flex-1 rounded-md border border-line bg-panel px-2 text-xs focus-ring text-fg"
        placeholder="Field value"
        required
      />
      <button
        type="submit"
        disabled={!key.trim() || !val.trim()}
        className="bg-accent hover:bg-accent-strong disabled:opacity-40 text-white px-2.5 py-1.5 rounded text-[11px] font-semibold transition shrink-0"
      >
        + Add
      </button>
    </form>
  );
}
