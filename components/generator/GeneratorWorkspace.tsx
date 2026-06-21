"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { FileUp, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { IMAGE_STYLES, OUTPUT_LANGUAGES, SCENE_GROUPINGS, VIDEO_TYPES } from "@/src/lib/constants";
import { PLAN_LIMITS } from "@/src/lib/plan-config";
import type { ContentPack, GenerateOptions, ImageStyle, OutputLanguage, PlanUsage, SceneGrouping, VideoType } from "@/src/lib/types";
import { OutputTabs } from "./OutputTabs";

const sampleSrt = `1
00:00:00,000 --> 00:00:05,000
I worked the night shift at an old hospital.

2
00:00:05,000 --> 00:00:10,000
My boss gave me a strange list of rules.

3
00:00:10,000 --> 00:00:16,000
The first rule said never answer the phone after midnight.`;

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

export function GeneratorWorkspace({ usage }: { usage: PlanUsage }) {
  const planLimits = PLAN_LIMITS[usage.plan];
  const [inputText, setInputText] = useState(sampleSrt);
  const [videoType, setVideoType] = useState<VideoType>("Horror Story");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("Dark Cinematic");
  const [language, setLanguage] = useState<OutputLanguage>("English");
  const [sceneGrouping, setSceneGrouping] = useState<SceneGrouping>("Auto");
  const [pack, setPack] = useState<ContentPack | null>(null);
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

  const canGenerate = useMemo(() => inputText.trim().length >= 10 && !loading, [inputText, loading]);
  const usageLabel =
    usage.dailyLimit !== null
      ? `${usage.dailyGenerations} / ${usage.dailyLimit} generations today`
      : usage.monthlyLimit !== null
        ? `${usage.monthlyGenerations} / ${usage.monthlyLimit} generations this month`
        : "Unlimited generations";

  async function refreshStats(nextText = inputText, nextGrouping = sceneGrouping) {
    const response = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputText: nextText, sceneGrouping: nextGrouping })
    });
    if (response.ok) setStats(await response.json());
  }

  async function handleInputChange(value: string) {
    setInputText(value);
    setError("");
    await refreshStats(value);
  }

  async function handleGroupingChange(value: SceneGrouping) {
    setSceneGrouping(value);
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

  async function generate() {
    setLoading(true);
    setError("");
    setNotice("");
    setPack(null);

    const payload: GenerateOptions = {
      inputText,
      videoType,
      imageStyle,
      language,
      sceneGrouping,
      ...selectedOutputs
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generate failed.");
      setPack(data.contentPack);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
          title: pack.titles[0] || "Untitled Content Pack",
          inputText,
          inputType: stats.inputType,
          videoType,
          imageStyle,
          language,
          sceneCount: pack.scenePrompts.length,
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

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
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
              <p className="mt-1 text-sm text-muted">Paste SRT/script or upload a subtitle file to build character, storyboard, title, and export assets.</p>
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
            className="min-h-[360px] w-full resize-y rounded-md border border-line bg-panelSoft p-4 text-sm leading-6 text-fg focus-ring"
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
              <select value={videoType} onChange={(event) => setVideoType(event.target.value as VideoType)} className="h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring">
                {VIDEO_TYPES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Image Style">
              <div className="grid gap-2 sm:grid-cols-2">
                {IMAGE_STYLES.map((style) => {
                  const allowed = planLimits.allowedStyles.includes(style.value);
                  return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => allowed && setImageStyle(style.value)}
                    disabled={!allowed}
                    className={`rounded-lg border p-3 text-left transition ${
                      imageStyle === style.value ? "border-accent bg-accent/12" : "border-line bg-panelSoft hover:border-accent"
                    } ${!allowed ? "opacity-45" : ""}`}
                  >
                    <div className="text-sm font-medium">{style.value}</div>
                    <div className="mt-1 text-xs leading-5 text-muted">
                      {allowed ? style.description : `Upgrade for ${style.value}`}
                    </div>
                  </button>
                )})}
              </div>
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
                )})}
              </div>
            </Field>

            <Field label="Scene Grouping">
              <select value={sceneGrouping} onChange={(event) => void handleGroupingChange(event.target.value as SceneGrouping)} className="h-10 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring">
                {SCENE_GROUPINGS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
              {outputOptions.map((item) => {
                const allowed =
                  item.key === "includeThumbnail" ? planLimits.thumbnail :
                  item.key === "includeKeywords" ? planLimits.keywords :
                  true;
                return (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowed && selectedOutputs[item.key]}
                    disabled={!allowed}
                    onChange={(event) =>
                      setSelectedOutputs((current) => ({
                        ...current,
                        [item.key]: event.target.checked
                      }))
                    }
                    className="h-4 w-4 accent-violet-500"
                  />
                  <span className={!allowed ? "opacity-55" : ""}>{item.label}</span>
                </label>
              )})}
            </div>

            {error && <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">{error}</div>}
            {notice && <div className="rounded-md border border-success bg-green-500/10 p-3 text-sm text-success">{notice}</div>}

            <div className="sticky bottom-16 z-10 flex flex-wrap gap-3 rounded-lg border border-line bg-panel/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
              <Button type="button" size="lg" disabled={!canGenerate} onClick={() => void generate()}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? "Generating..." : "Generate Content Pack"}
              </Button>
              <Button type="button" size="lg" variant="secondary" disabled={!pack || saving} onClick={() => void saveProject()}>
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <div>
        {loading ? <LoadingPanel /> : <OutputTabs pack={pack} plan={usage.plan} />}
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
    <Panel className="min-h-[520px]">
      <h2 className="text-xl font-semibold">Turning your script into a creator-ready content pack...</h2>
      <div className="mt-6 space-y-4">
        {["Analyzing script", "Building character bible", "Laying out storyboard", "Creating title pack"].map((item) => (
          <div key={item} className="rounded-lg border border-line bg-panelSoft p-4">
            <div className="mb-3 flex items-center gap-3 text-sm">
              <Loader2 className="animate-spin text-accent" size={16} />
              {item}
            </div>
            <div className="h-3 w-full animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
