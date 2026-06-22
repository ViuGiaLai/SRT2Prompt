"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, FileJson, FileText, Send, RefreshCw, Sparkles, Loader2, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { exportAsCsv, exportAsMarkdown, exportAsText, exportForTaoAnhAI } from "@/src/lib/export";
import { PLAN_LIMITS } from "@/src/lib/plan-config";
import type { ContentPack, PlanName, CharacterBible } from "@/src/lib/types";
import { CopyButton } from "./CopyButton";
import { ScenePromptCard } from "./ScenePromptCard";
import { syncCharacterMemory, compileScenePrompt } from "@/src/lib/character-memory";
import { YouTubeMockup } from "./YouTubeMockup";

const tabs = ["Overview", "Intelligence", "Character Bible", "Storyboard", "Scene Prompts", "Thumbnail", "Titles", "Description", "Hashtags", "Export"] as const;

function HighlightedTitle({ title, keyword }: { title: string; keyword: string }) {
  if (!keyword.trim()) return <span>{title}</span>;

  const terms = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const relatedTerms = ["rule", "rules", "never", "always", "broken", "warning", "story", "stories", "terror", "creepy"];

  const words = title.split(/(\s+)/);

  return (
    <span>
      {words.map((word, index) => {
        const cleanWord = word.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!cleanWord) return <span key={index}>{word}</span>;

        if (terms.includes(cleanWord)) {
          return (
            <span key={index} className="bg-success/15 text-success font-semibold px-0.5 rounded border border-success/20">
              {word}
            </span>
          );
        }

        if (relatedTerms.includes(cleanWord) || /^\d+$/.test(cleanWord)) {
          return (
            <span key={index} className="bg-warning/15 text-warning font-semibold px-0.5 rounded border border-warning/20">
              {word}
            </span>
          );
        }

        return <span key={index}>{word}</span>;
      })}
    </span>
  );
}

export function OutputTabs({
  pack,
  plan = "Free",
  projectId,
  activeTab: externalActiveTab,
  onActiveTabChange: externalSetActiveTab
}: {
  pack: ContentPack | null;
  plan?: PlanName;
  projectId?: string;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
}) {
  const [internalActive, internalSetActive] = useState<(typeof tabs)[number]>("Overview");

  const active = externalActiveTab !== undefined ? (externalActiveTab as (typeof tabs)[number]) : internalActive;
  const setActive = (tab: (typeof tabs)[number]) => {
    if (externalSetActiveTab) {
      externalSetActiveTab(tab);
    } else {
      internalSetActive(tab);
    }
  };

  const [currentPack, setCurrentPack] = useState<ContentPack | null>(pack);
  
  // Dynamic Character Memory Compiler (On-the-fly prompt stitching)
  const compiledPack = useMemo((): ContentPack | null => {
    if (!currentPack) return null;
    const { scenePrompts, storyboard } = syncCharacterMemory(
      currentPack.scenePrompts,
      currentPack.storyboard,
      currentPack.characterBible,
      currentPack.imageStyle
    );
    return {
      ...currentPack,
      scenePrompts,
      storyboard
    };
  }, [currentPack]);

  const [editingScene, setEditingScene] = useState("");
  const [regeneratingScene, setRegeneratingScene] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [notice, setNotice] = useState("");
  const [extensionDetected, setExtensionDetected] = useState(false);
  
  // Character visual consistency forms states
  const [charName, setCharName] = useState(pack?.characterBible?.name || "");
  const [charAge, setCharAge] = useState(pack?.characterBible?.age || "");
  const [charGender, setCharGender] = useState(pack?.characterBible?.gender || "");
  const [charHair, setCharHair] = useState(pack?.characterBible?.hair || "");
  const [charClothes, setCharClothes] = useState(pack?.characterBible?.clothes || "");

  // Viral Title Engine States
  const [viralKeyword, setViralKeyword] = useState(pack?.intelligence?.keywordPack?.primary || "");
  const [viralLoading, setViralLoading] = useState(false);
  const [viralResult, setViralResult] = useState<any | null>(null);

  // Live YouTube Mockup States
  const [mockupTitle, setMockupTitle] = useState(pack?.titles?.[0] || pack?.titlePack?.curiosity?.[0] || "");
  const [mockupThumbnailText, setMockupThumbnailText] = useState(pack?.thumbnail?.textOverlay || "");
  const [mockupChannelName, setMockupChannelName] = useState("Rmah Horror");

  const visibleTabs = useMemo(() => getVisibleTabs(compiledPack, plan), [compiledPack, plan]);
  const textExport = useMemo(() => (compiledPack ? exportAsText(compiledPack) : ""), [compiledPack]);
  const markdownExport = useMemo(() => (compiledPack ? exportAsMarkdown(compiledPack) : ""), [compiledPack]);
  const csvExport = useMemo(() => (compiledPack ? exportAsCsv(compiledPack) : ""), [compiledPack]);
  const taoAnhAIExport = useMemo(() => (compiledPack ? exportForTaoAnhAI(compiledPack) : ""), [compiledPack]);
  const exportFormats = PLAN_LIMITS[plan].exportFormats;
  const taoAnhAIDownloadUrl = process.env.NEXT_PUBLIC_TAOANH_AI_DOWNLOAD_URL?.trim() || "";

  useEffect(() => {
    setCurrentPack(pack);
    if (!externalActiveTab) {
      setActive("Overview");
    }
    setEditingScene("");
    setRegeneratingScene("");
    setViralResult(null);
    
    if (pack?.characterBible) {
      setCharName(pack.characterBible.name || "");
      setCharAge(pack.characterBible.age || "");
      setCharGender(pack.characterBible.gender || "");
      setCharHair(pack.characterBible.hair || "");
      setCharClothes(pack.characterBible.clothes || "");
    }

    if (pack?.intelligence?.keywordPack?.primary) {
      setViralKeyword(pack.intelligence.keywordPack.primary);
    } else {
      setViralKeyword("");
    }

    if (pack) {
      setMockupTitle(pack.titles?.[0] || pack.titlePack?.curiosity?.[0] || "");
      setMockupThumbnailText(pack.thumbnail?.textOverlay || "");
      setMockupChannelName("Rmah Horror");
    } else {
      setMockupTitle("");
      setMockupThumbnailText("");
    }
  }, [pack, externalActiveTab]);

  useEffect(() => {
    if (viralResult) {
      if (viralResult.bestTitle) {
        setMockupTitle(viralResult.bestTitle);
      }
      if (viralResult.thumbnailTextScore?.text) {
        setMockupThumbnailText(viralResult.thumbnailTextScore.text);
      }
    }
  }, [viralResult]);

  useEffect(() => {
    if (currentPack && !visibleTabs.includes(active)) {
      setActive(visibleTabs[0]);
    }
  }, [active, currentPack, visibleTabs]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeout: number | undefined;
    let interval: number | undefined;

    const handler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type === "TAO_ANH_AI_PONG") {
        setExtensionDetected(true);
      }
      if (event.data?.type === "TAO_ANH_AI_IMPORT_ACK") {
        setNotice(`Sent ${event.data.count || 0} prompt${event.data.count === 1 ? "" : "s"} to TaoAnhAI.`);
      }
    };

    window.addEventListener("message", handler);

    const ping = () => {
      setExtensionDetected(false);
      window.postMessage({ type: "TAO_ANH_AI_PING" }, window.location.origin);
      timeout = window.setTimeout(() => setExtensionDetected(false), 800);
    };

    ping();
    interval = window.setInterval(ping, 5000);

    return () => {
      window.removeEventListener("message", handler);
      if (timeout) window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  if (!currentPack || !compiledPack) {
    return (
      <Panel className="flex min-h-[520px] items-center justify-center text-center">
        <div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-line bg-panelSoft">
            <FileText className="text-accent" size={28} />
          </div>
          <h2 className="text-xl font-semibold">Your content pack will appear here.</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Paste a script or upload an SRT file to generate scene prompts, thumbnail prompt, titles,
            description, hashtags, and keywords.
          </p>
        </div>
      </Panel>
    );
  }

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function sceneKey(sceneRange: string, timestamp: string) {
    return `${sceneRange}-${timestamp}`;
  }

  function updateScene(sceneRange: string, timestamp: string, nextSummary: string) {
    setCurrentPack((current) => {
      if (!current) return null;
      const updatedScenes = current.scenePrompts.map((scene) => {
        if (scene.sceneRange === sceneRange && scene.timestamp === timestamp) {
          const updatedItem = { ...scene, summary: nextSummary };
          updatedItem.imagePrompt = compileScenePrompt(updatedItem, current.characterBible, current.imageStyle);
          return updatedItem;
        }
        return scene;
      });
      return {
        ...current,
        scenePrompts: updatedScenes
      };
    });
  }

  function deleteScene(sceneRange: string, timestamp: string) {
    setCurrentPack((current) =>
      current
        ? {
            ...current,
            scenePrompts: current.scenePrompts.filter(
              (scene) => !(scene.sceneRange === sceneRange && scene.timestamp === timestamp)
            )
          }
        : current
    );
  }

  async function runViralEngine() {
    if (!compiledPack || !viralKeyword.trim()) return;
    setViralLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/viral-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: viralKeyword.trim(),
          summary: compiledPack.summary,
          videoType: compiledPack.videoType,
          thumbnailText: compiledPack.thumbnail?.textOverlay || ""
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Viral analysis failed.");
      setViralResult(data.analysis);
      setNotice("Viral Engine analysis complete.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Viral analysis failed.");
    } finally {
      setViralLoading(false);
    }
  }

  const updateCharacterBibleField = (field: keyof CharacterBible, value: string) => {
    if (field === "name") setCharName(value);
    else if (field === "age") setCharAge(value);
    else if (field === "gender") setCharGender(value);
    else if (field === "hair") setCharHair(value);
    else if (field === "clothes") setCharClothes(value);

    setCurrentPack((prev) => {
      if (!prev) return null;
      
      const updatedBible = {
        ...prev.characterBible,
        [field]: value
      };

      const { scenePrompts, storyboard } = syncCharacterMemory(
        prev.scenePrompts,
        prev.storyboard,
        updatedBible,
        prev.imageStyle
      );

      return {
        ...prev,
        characterBible: updatedBible,
        scenePrompts,
        storyboard
      };
    });
  };

  async function regenerateScene(sceneRange: string, timestamp: string) {
    const scene = currentPack?.scenePrompts.find(
      (item) => item.sceneRange === sceneRange && item.timestamp === timestamp
    );
    if (!scene || !currentPack) return;

    const key = sceneKey(scene.sceneRange, scene.timestamp);
    setRegeneratingScene(key);
    try {
      const response = await fetch("/api/regenerate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene,
          videoType: currentPack.videoType,
          imageStyle: currentPack.imageStyle,
          language: currentPack.language,
          characterBible: currentPack.characterBible
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not regenerate scene.");
      setCurrentPack((current) =>
        current
          ? {
              ...current,
              scenePrompts: current.scenePrompts.map((item) =>
                item.sceneRange === sceneRange && item.timestamp === timestamp ? data.scene : item
              )
            }
          : current
      );
    } finally {
      setRegeneratingScene("");
    }
  }

  function handleUpdateSceneMetadata(
    sceneRange: string,
    timestamp: string,
    field: "cameraAngle" | "lighting" | "emotion",
    value: string
  ) {
    setCurrentPack((current) => {
      if (!current) return null;
      return {
        ...current,
        scenePrompts: current.scenePrompts.map((item) => {
          if (item.sceneRange === sceneRange && item.timestamp === timestamp) {
            return {
              ...item,
              [field]: value
            };
          }
          return item;
        })
      };
    });
    setNotice(`Updated ${field} to "${value}". Click the refresh icon to regenerate.`);
  }

  async function saveChanges() {
    if (!projectId || !currentPack) return;
    setSavingChanges(true);
    setNotice("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentPack: currentPack,
          videoType: currentPack.videoType,
          imageStyle: currentPack.imageStyle,
          language: currentPack.language
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save changes.");
      setNotice("Changes saved.");
    } finally {
      setSavingChanges(false);
    }
  }

  async function exportToNotion() {
    if (!currentPack) return;
    try {
      setNotice("Exporting to Notion...");
      const response = await fetch("/api/export/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: currentPack })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not export to Notion.");
      setNotice("Exported to Notion.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not export to Notion.");
    }
  }

  async function exportToDrive(format: "txt" | "md" | "json") {
    if (!currentPack) return;
    try {
      setNotice("Exporting to Drive...");
      const response = await fetch("/api/export/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: currentPack, format })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not export to Drive.");
      setNotice("Exported to Drive.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not export to Drive.");
    }
  }

  async function copyTaoAnhAIPackage() {
    if (!currentPack) return;
    await navigator.clipboard.writeText(taoAnhAIExport);
    setNotice("TaoAnhAI package copied to clipboard.");
  }

  async function sendToTaoAnhAI() {
    if (!compiledPack) return;
    const prompts = [
      compiledPack.thumbnail.prompt,
      ...compiledPack.scenePrompts.map((scene) => scene.imagePrompt)
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    if (!prompts.length) {
      setNotice("No image prompts available for TaoAnhAI.");
      return;
    }

    setNotice("Sending to TaoAnhAI...");
    window.postMessage(
      {
        type: "TAO_ANH_AI_IMPORT_QUEUE",
        payload: { prompts }
      },
      window.location.origin
    );
    window.setTimeout(() => {
      if (!extensionDetected) {
        setNotice(
          taoAnhAIDownloadUrl
            ? "TaoAnhAI was not detected. Download it from Drive and load the unpacked folder in Chrome."
            : "TaoAnhAI was not detected. Load the unpacked folder in Chrome extensions."
        );
      }
    }, 1200);
  }

  async function sendThumbnailOnly() {
    if (!compiledPack?.thumbnail.prompt.trim()) return;
    window.postMessage(
      {
        type: "TAO_ANH_AI_IMPORT_QUEUE",
        payload: { prompts: [compiledPack.thumbnail.prompt.trim()] }
      },
      window.location.origin
    );
  }

  async function sendScenesOnly() {
    if (!compiledPack) return;
    const prompts = compiledPack.scenePrompts.map((scene) => scene.imagePrompt.trim()).filter(Boolean);
    if (!prompts.length) return;
    window.postMessage(
      {
        type: "TAO_ANH_AI_IMPORT_QUEUE",
        payload: { prompts }
      },
      window.location.origin
    );
  }

  return (
    <Panel>
      {projectId && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-panelSoft p-3">
          <div className="min-w-0 space-y-1">
            <span className="text-sm text-muted">{notice || "Edit scene prompts, description, or titles, then save changes."}</span>
            <div className="text-xs text-muted">
              TaoAnhAI: <span className={extensionDetected ? "text-success" : "text-warning"}>{extensionDetected ? "detected" : "not detected"}</span>
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void saveChanges()} disabled={savingChanges}>
            {savingChanges ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            data-taoanhai-export-tab={tab === "Export" ? "true" : undefined}
            onClick={() => setActive(tab)}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
              active === tab ? "bg-accent text-white" : "bg-panelSoft text-muted hover:text-fg"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard label="Summary" value={currentPack.summary} />
          <SummaryCard label="Video Type" value={String(currentPack.videoType)} />
          <SummaryCard label="Scenes" value={`${currentPack.scenePrompts.length} scenes`} />
          <SummaryCard label="Style" value={String(currentPack.imageStyle)} />
          <SummaryCard label="Main Character" value={currentPack.characterBible.name} />
          <SummaryCard label="Character Memory" value={currentPack.characterBible.consistencyNotes} />
          <SummaryCard label="Overall Score" value={`${currentPack.intelligence.viralScore.overall}/100`} />
          <SummaryCard label="Story Type" value={currentPack.intelligence.storyType} />
        </div>
      )}

      {active === "Intelligence" && (
        <div className="space-y-4">
          <SourceStatusGrid status={currentPack.intelligence.sourceStatus} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ScoreCard title="Viral Score" score={currentPack.intelligence.viralScore} />
            <SummaryCard label="Story Type" value={currentPack.intelligence.storyType} />
            <SummaryCard label="Primary Keyword" value={currentPack.intelligence.keywordPack.primary} />
            <SummaryCard label="SEO Density" value={currentPack.intelligence.descriptionEngine.seoDensity} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <EngineBlock title="Story Engine" items={currentPack.intelligence.storyEngine.characters} note={currentPack.intelligence.storyEngine.structure} />
            <EngineBlock title="Scene Engine" items={currentPack.intelligence.sceneEngine.notes} note={currentPack.intelligence.sceneEngine.beats.join(" -> ")} />
            <EngineBlock title="Keyword Engine" items={currentPack.intelligence.keywordPack.secondary} note={currentPack.intelligence.keywordPack.longTail.join(" | ")} />
            <EngineBlock title="Competitor Engine" items={currentPack.intelligence.competitorEngine.map((item) => item.name)} note={currentPack.intelligence.competitorEngine[0]?.descriptionPattern || "No competitor data"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PresetBlock title="Flux" content={currentPack.intelligence.imagePromptPresets.flux} />
            <PresetBlock title="Midjourney" content={currentPack.intelligence.imagePromptPresets.midjourney} />
            <PresetBlock title="ChatGPT Image" content={currentPack.intelligence.imagePromptPresets.chatgpt} />
            <PresetBlock title="Leonardo" content={currentPack.intelligence.imagePromptPresets.leonardo} />
          </div>
        </div>
      )}

      {active === "Character Bible" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-fg">Character Visual Memory</h3>
              <p className="text-xs text-muted mt-0.5">Tweak the 4 core attributes to enforce visual consistency across all scene image prompts in real-time.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 bg-panelSoft/30 p-4 rounded-lg border border-line">
            <label className="block">
              <span className="text-xs font-semibold text-fg">Character Name</span>
              <input
                type="text"
                value={charName}
                onChange={(e) => updateCharacterBibleField("name", e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                placeholder="e.g. Jack"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg">Age Category</span>
              <input
                type="text"
                value={charAge}
                onChange={(e) => updateCharacterBibleField("age", e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                placeholder="e.g. 30-year-old adult"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg">Gender</span>
              <input
                type="text"
                value={charGender}
                onChange={(e) => updateCharacterBibleField("gender", e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                placeholder="e.g. male"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg">Hair Style & Color (Core)</span>
              <input
                type="text"
                value={charHair}
                onChange={(e) => updateCharacterBibleField("hair", e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                placeholder="e.g. messy black hair"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-fg">Clothes & Wardrobe (Core)</span>
              <input
                type="text"
                value={charClothes}
                onChange={(e) => updateCharacterBibleField("clothes", e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-panelSoft px-3 text-xs focus-ring text-fg"
                placeholder="e.g. green canvas jacket and blue jeans"
              />
            </label>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard label="Personality" value={compiledPack.characterBible.personality} />
            <SummaryCard label="Consistency Notes" value={compiledPack.characterBible.consistencyNotes} />
          </div>
        </div>
      )}

      {active === "Storyboard" && (
        <div className="space-y-4">
          {compiledPack.storyboard.map((scene) => (
            <div key={`${scene.sceneRange}-${scene.timestamp}`} className="rounded-lg border border-line bg-panelSoft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted">Scene {scene.sceneRange}</div>
                  <div className="mt-1 text-sm font-semibold text-fg">{scene.beat}</div>
                  <div className="mt-1 text-xs text-muted">{scene.timestamp}</div>
                </div>
                <CopyButton text={`${scene.summary}\n${scene.imagePrompt}`} label="Copy Scene" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Camera" value={scene.cameraAngle} />
                <SummaryCard label="Lighting" value={scene.lighting} />
                <SummaryCard label="Emotion" value={scene.emotion} />
              </div>
              <div className="mt-4 space-y-3">
                <OutputBlock title="Summary" content={scene.summary} />
                <OutputBlock title="Image Prompt" content={scene.imagePrompt} />
              </div>
            </div>
          ))}
        </div>
      )}

      {active === "Scene Prompts" && (
        <div className="space-y-4">
          {compiledPack.scenePrompts.map((scene) => (
            <ScenePromptCard
              key={`${scene.sceneRange}-${scene.timestamp}`}
              scene={scene}
              editing={editingScene === sceneKey(scene.sceneRange, scene.timestamp)}
              regenerating={regeneratingScene === sceneKey(scene.sceneRange, scene.timestamp)}
              onDelete={() => deleteScene(scene.sceneRange, scene.timestamp)}
              onEdit={(nextPrompt) => updateScene(scene.sceneRange, scene.timestamp, nextPrompt)}
              onRegenerate={() => void regenerateScene(scene.sceneRange, scene.timestamp)}
              onToggleEdit={() =>
                setEditingScene((current) =>
                  current === sceneKey(scene.sceneRange, scene.timestamp) ? "" : sceneKey(scene.sceneRange, scene.timestamp)
                )
              }
              onUpdateMetadata={(field, value) => handleUpdateSceneMetadata(scene.sceneRange, scene.timestamp, field, value)}
            />
          ))}
        </div>
      )}

      {active === "Thumbnail" && (
        <div className="space-y-4">
          <OutputBlock title="Thumbnail Prompt" content={compiledPack.thumbnail.prompt} />
          <OutputBlock title="Text Overlay" content={compiledPack.thumbnail.textOverlay} />
          <OutputBlock title="Composition Notes" content={compiledPack.thumbnail.compositionNotes} />
          <CopyButton text={compiledPack.thumbnail.prompt} label="Copy Thumbnail Prompt" />
        </div>
      )}

      {active === "Titles" && (
        <div className="space-y-6">
          {/* Live YouTube Feed Mockup Card */}
          <YouTubeMockup
            title={mockupTitle}
            thumbnailText={mockupThumbnailText}
            channelName={mockupChannelName}
            availableTitles={
              viralResult
                ? [viralResult.bestTitle, ...viralResult.topTitles]
                : [
                    ...(compiledPack?.titles || []),
                    ...(compiledPack?.titlePack?.curiosity || []),
                    ...(compiledPack?.titlePack?.fear || []),
                  ].slice(0, 8)
            }
            onTitleChange={setMockupTitle}
            onThumbnailTextChange={setMockupThumbnailText}
            onChannelNameChange={setMockupChannelName}
          />

          {/* Viral Engine Widget */}
          <div className="rounded-lg border border-accent/20 bg-panelSoft/30 p-5 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-fg flex items-center gap-1.5">
                  <Sparkles size={16} className="text-accent animate-pulse" /> Viral Engine Title Analyzer
                </h3>
                <p className="text-xs text-muted mt-0.5">Analyze search demand autocompletes, YouTube keyword volumes and competitors to predict CTR/SEO score optimization.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-fg uppercase tracking-wider text-muted">
                Target Keyword
              </label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input
                  type="text"
                  value={viralKeyword}
                  onChange={(e) => setViralKeyword(e.target.value)}
                  className="h-9 flex-1 rounded-md border border-line bg-panel px-3 text-xs focus-ring text-fg"
                  placeholder="Enter target keyword... (e.g. night shift hospital horror)"
                />
                <button
                  onClick={runViralEngine}
                  disabled={viralLoading || !viralKeyword.trim()}
                  className="bg-accent hover:bg-accent-strong disabled:bg-accent/35 text-white px-4 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0 h-9"
                >
                  {viralLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                  {viralLoading ? "Analyzing..." : "Analyze & Generate"}
                </button>
              </div>
              <p className="text-[11px] text-muted">
                {viralLoading 
                  ? "Running analysis (usually takes 3-8 seconds due to live search requests)..." 
                  : "Analysis takes 3-8 seconds (or 1-2 seconds if cached). No guaranteed views, only predicted CTR/SEO optimization."
                }
              </p>
            </div>

            {/* Analysis Results Display */}
            {viralResult && (
              <div className="space-y-5 border-t border-line/50 pt-4 animate-fadeIn">
                
                {/* Best Title Section */}
                <div 
                  className={`rounded-lg border p-4 space-y-3 cursor-pointer transition ${
                    mockupTitle === viralResult.bestTitle 
                      ? "border-accent bg-accent/5 ring-1 ring-accent/30 shadow-md" 
                      : "border-line bg-panelSoft/20 hover:border-accent/40"
                  }`}
                  onClick={() => setMockupTitle(viralResult.bestTitle)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold text-accent tracking-wider flex items-center gap-1.5">
                        {mockupTitle === viralResult.bestTitle && <Eye size={10} className="text-accent animate-pulse" />}
                        <span>Best Title (Click to preview)</span>
                      </div>
                      <h4 className="mt-1 text-base font-bold text-fg">
                        <HighlightedTitle title={viralResult.bestTitle} keyword={viralKeyword} />
                      </h4>
                    </div>
                    <div className="rounded-md bg-accent px-3 py-1.5 text-center text-white shrink-0">
                      <div className="text-[10px] uppercase font-medium">Score</div>
                      <div className="text-sm font-bold">{viralResult.overallScore}/100</div>
                    </div>
                  </div>
                  
                  {/* Hook Breakdown & Why this title works side-by-side */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t border-line/40 pt-3">
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-muted tracking-wider flex items-center justify-between">
                        <span>Hook Breakdown</span>
                        <span className="text-accent">{viralResult.hookScore || 0}/100</span>
                      </h5>
                      <div className="mt-2 space-y-1">
                        {viralResult.hookBreakdown && viralResult.hookBreakdown.map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-success">
                            <span className="font-semibold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-muted tracking-wider">
                        Why this title works
                      </h5>
                      <p className="mt-2 text-xs text-muted leading-5">
                        {viralResult.whyItWorks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score board card */}
                <div className="rounded-lg border border-line bg-panel p-4 space-y-4">
                  <h4 className="text-xs font-semibold text-fg uppercase tracking-wider text-muted">
                    KPI Score Board
                  </h4>
                  <div className="space-y-4">
                    {/* Primary Engagement Row */}
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                      <ScoreMetric label="SEO Match" score={viralResult.seoMatchScore} />
                      <ScoreMetric label="CTR Hook" score={viralResult.ctrHookScore} />
                      <ScoreMetric label="Curiosity" score={viralResult.curiosityScore} />
                      <ScoreMetric label="Emotion" score={viralResult.emotionScore} />
                    </div>
                    {/* Formatting Row */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 border-t border-line/30 pt-4">
                      <ScoreMetric label="Uniqueness" score={viralResult.uniquenessRating} />
                      <ScoreMetric label="Length" score={viralResult.lengthScore} />
                      <ScoreMetric label="Mobile Read" score={viralResult.mobileReadability} />
                    </div>
                  </div>
                </div>

                {/* Thumbnail Text Score Analysis */}
                {viralResult.thumbnailTextScore && (
                  <div className="rounded-lg border border-line bg-panel p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-fg uppercase tracking-wider text-muted">
                          Thumbnail Text Analysis
                        </h4>
                        <div className="mt-1 text-sm font-bold text-fg italic">
                          "{viralResult.thumbnailTextScore.text}"
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-medium text-muted">Curiosity trigger</div>
                        <div className="text-xs font-semibold text-success">
                          {viralResult.thumbnailTextScore.curiosity}/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="bg-panelSoft/50 p-2.5 rounded border border-line/45">
                        <div className="text-[10px] uppercase font-semibold text-muted">Readability</div>
                        <div className="text-xs font-bold text-fg mt-0.5">{viralResult.thumbnailTextScore.readability}/100</div>
                      </div>
                      <div className="bg-panelSoft/50 p-2.5 rounded border border-line/45">
                        <div className="text-[10px] uppercase font-semibold text-muted">Emotion</div>
                        <div className="text-xs font-bold text-fg mt-0.5">{viralResult.thumbnailTextScore.emotion}/100</div>
                      </div>
                      <div className="bg-panelSoft/50 p-2.5 rounded border border-line/45">
                        <div className="text-[10px] uppercase font-semibold text-muted">Curiosity</div>
                        <div className="text-xs font-bold text-fg mt-0.5">{viralResult.thumbnailTextScore.curiosity}/100</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted leading-5">
                      <span className="font-semibold text-accent">Analysis:</span> {viralResult.thumbnailTextScore.notes}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-fg uppercase tracking-wider text-muted flex items-center gap-1.5">
                    Top 5 Optimized Titles
                  </h4>
                  <div className="grid gap-2">
                    {viralResult.topTitles.map((title: string, index: number) => {
                      const computedSeo = Math.max(60, Math.min(100, viralResult.seoMatchScore - index * 3));
                      const computedCtr = Math.max(60, Math.min(100, viralResult.ctrHookScore - index * 2));
                      const isPreviewing = mockupTitle === title;
                      return (
                        <div 
                          key={index} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition cursor-pointer ${
                            isPreviewing 
                              ? "bg-accent/5 border-accent ring-1 ring-accent/30" 
                              : "bg-panel border-line hover:border-accent/40"
                          }`}
                          onClick={() => setMockupTitle(title)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-fg leading-6 block sm:inline flex items-center gap-1.5">
                                {isPreviewing && <Eye size={10} className="text-accent shrink-0 animate-pulse" />}
                                <HighlightedTitle title={title} keyword={viralKeyword} />
                              </span>
                              <div className="mt-1 sm:mt-0 sm:ml-3 inline-flex gap-2 text-[10px] font-medium text-muted">
                                <span className="bg-panelSoft px-1.5 py-0.5 rounded border border-line/45">SEO: {computedSeo}</span>
                                <span className="bg-panelSoft px-1.5 py-0.5 rounded border border-line/45">CTR: {computedCtr}</span>
                              </div>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <CopyButton text={title} label="Copy" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  {/* Real Search Keywords */}
                  <div className="rounded-lg border border-line bg-panel p-4 space-y-3">
                    <h4 className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                      Real Search Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viralResult.trendingSuggestions.length > 0 ? (
                        viralResult.trendingSuggestions.map((item: string) => (
                          <span key={item} className="bg-panelSoft text-muted px-2 py-0.5 rounded text-[11px] font-medium border border-line/40">
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted text-[11px]">No suggestion signals found.</span>
                      )}
                    </div>
                  </div>

                  {/* Competitor titles list */}
                  <div className="rounded-lg border border-line bg-panel p-4 space-y-3">
                    <h4 className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                      Competitor Titles
                    </h4>
                    <div className="space-y-2">
                      {viralResult.competitors.map((item: any, i: number) => (
                        <div key={i} className="text-[11px] text-muted truncate border-b border-line/30 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-semibold text-fg mr-1 shrink-0 bg-panelSoft/80 px-1.5 py-0.5 rounded text-[10px] border border-line/40">
                            {item.channelName}
                          </span>
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Viral Engine improvement tips */}
                <div className="rounded-lg border border-line bg-panel p-4 space-y-2">
                  <h4 className="text-[10px] uppercase font-semibold text-muted tracking-wider text-accent">
                    Growth Engine Suggestions
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-muted leading-5">
                    {viralResult.improvementNotes.map((note: string, i: number) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Fallback Titles List Header */}
          <div className="border-t border-line/50 pt-5">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-fg">Other Title Concepts</h4>
              <p className="text-xs text-muted mt-0.5">Alternative ideas sorted by psychological category to help brainstorming.</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <TitleGroupCard title="Curiosity" titles={compiledPack.titlePack.curiosity} />
              <TitleGroupCard title="Fear" titles={compiledPack.titlePack.fear} />
              <TitleGroupCard title="Question" titles={compiledPack.titlePack.question} />
              <TitleGroupCard title="Clickbait" titles={compiledPack.titlePack.clickbait} />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <CopyButton text={compiledPack.titles.join("\n")} label="Copy All Category Titles" />
            </div>
          </div>
        </div>
      )}

      {active === "Description" && (
        <div className="space-y-3">
          <textarea
            className="min-h-56 w-full resize-y rounded-md border border-line bg-panelSoft p-4 text-sm leading-6 text-fg focus-ring"
            value={currentPack.description}
            onChange={(event) =>
              setCurrentPack((current) => current ? { ...current, description: event.target.value } : current)
            }
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={currentPack.description} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setCurrentPack((current) =>
                  current
                    ? { ...current, description: current.description.split(". ").slice(0, 2).join(". ") }
                    : current
                )
              }
            >
              Rewrite Shorter
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setCurrentPack((current) =>
                  current
                    ? { ...current, description: `${current.description}\n\nThis story builds tension with a clear visual hook and a strong reason to keep watching.` }
                    : current
                )
              }
            >
              Rewrite More Dramatic
            </Button>
          </div>
          <p className="text-xs text-warning">Review before publishing.</p>
        </div>
      )}

      {active === "Hashtags" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {compiledPack.hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-panelSoft px-3 py-2 text-sm text-fg">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={currentPack.hashtags.join(" ")} label="Copy All" />
            <CopyButton text={currentPack.keywords.join(", ")} label="Copy YouTube Tags" />
          </div>
        </div>
      )}

      {active === "Export" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {exportFormats.includes("txt") && (
              <Button type="button" variant="secondary" onClick={() => download("srt2prompt-pack.txt", textExport, "text/plain")}>
                <Download size={16} />
                Export .txt
              </Button>
            )}
            {exportFormats.includes("md") && (
              <Button type="button" variant="secondary" onClick={() => download("srt2prompt-pack.md", markdownExport, "text/markdown")}>
                <FileText size={16} />
                Export .md
              </Button>
            )}
            {exportFormats.includes("json") && (
              <Button type="button" variant="secondary" onClick={() => download("srt2prompt-pack.json", JSON.stringify(currentPack, null, 2), "application/json")}>
                <FileJson size={16} />
                Export .json
              </Button>
            )}
            {exportFormats.includes("csv") && (
              <Button type="button" variant="secondary" onClick={() => download("srt2prompt-pack.csv", csvExport, "text/csv")}>
                <FileText size={16} />
                Export .csv
              </Button>
            )}
            <CopyButton text={textExport} label="Copy Full Pack" />
            <Button type="button" variant="secondary" onClick={() => void exportToNotion()}>
              Export to Notion
            </Button>
            <Button type="button" variant="secondary" onClick={() => void exportToDrive("md")}>
              Export to Drive
            </Button>
          </div>

          <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/12 via-panelSoft to-panel p-4 shadow-sm ring-1 ring-accent/15">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${extensionDetected ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                    {extensionDetected ? "Extension detected" : "Extension not detected"}
                  </span>
                  <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    TaoAnhAI bridge
                  </span>
                </div>
                <h3 className="text-base font-semibold text-fg">Send image prompts directly to TaoAnhAI</h3>
                <p className="max-w-2xl text-sm leading-6 text-muted">
                  Push the thumbnail prompt or scene prompts to the extension without copy-paste. Use the main button for the full queue, or send only what you need.
                </p>
              </div>
              {taoAnhAIDownloadUrl ? (
                <a
                  href={taoAnhAIDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-accent/30 bg-panel px-4 py-2 text-sm font-medium text-fg transition hover:border-accent hover:shadow-sm"
                >
                  <ExternalLink size={16} />
                  Download TaoAnhAI
                </a>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                type="button"
                onClick={() => void sendToTaoAnhAI()}
                className={`group justify-start border-transparent bg-gradient-to-r from-accent to-accent-strong text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${extensionDetected ? "animate-pulse" : ""}`}
              >
                <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                Send full queue
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void sendThumbnailOnly()}
                className="justify-start"
              >
                <Send size={16} />
                Send thumbnail only
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void sendScenesOnly()}
                className="justify-start"
              >
                <Send size={16} />
                Send scenes only
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void copyTaoAnhAIPackage()}
                className="justify-start sm:col-span-2 lg:col-span-1"
              >
                <Send size={16} />
                Copy for TaoAnhAI
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => download("taoanhai-queue.json", taoAnhAIExport, "application/json")}
                className="justify-start sm:col-span-2 lg:col-span-1"
              >
                <Download size={16} />
                Download TaoAnhAI JSON
              </Button>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted">
              If the extension is not installed yet, download the TaoAnhAI package, unzip it, then load it in Chrome via
              <span className="mx-1 font-medium text-fg">chrome://extensions</span>
              and
              <span className="mx-1 font-medium text-fg">Load unpacked</span>.
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}

function getVisibleTabs(pack: ContentPack | null, plan: PlanName = "Free"): Array<(typeof tabs)[number]> {
  if (!pack) return ["Overview"];
  return tabs.filter((tab) => {
    if (tab === "Export") return PLAN_LIMITS[plan].exportFormats.length > 0;
    if (tab === "Thumbnail") return Boolean(pack.thumbnail.prompt);
    if (tab === "Titles") return pack.titles.length > 0;
    if (tab === "Description") return Boolean(pack.description);
    if (tab === "Hashtags") return pack.hashtags.length > 0 || pack.keywords.length > 0;
    return true;
  });
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted">{label}</div>
      <div className="text-sm leading-6 text-fg">{value}</div>
    </div>
  );
}

function OutputBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted">{title}</div>
      <p className="text-sm leading-6 text-fg">{content}</p>
    </div>
  );
}

function TitleGroupCard({ title, titles }: { title: string; titles: string[] }) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-normal text-muted">{title}</div>
          <div className="mt-1 text-sm text-fg">{titles.length} titles</div>
        </div>
        <CopyButton text={titles.join("\n")} label={`Copy ${title}`} />
      </div>
      <div className="mt-4 space-y-2">
        {titles.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-md border border-line bg-panel p-3 text-sm text-fg">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: { seo: number; ctr: number; emotion: number; curiosity: number; competition: number; trend: number; overall: number; notes: string[] } }) {
  const items = [
    ["SEO", score.seo],
    ["CTR", score.ctr],
    ["Emotion", score.emotion],
    ["Curiosity", score.curiosity],
    ["Competition", score.competition],
    ["Trend", score.trend]
  ] as const;

  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-normal text-muted">{title}</div>
        <div className="text-sm font-semibold text-fg">Overall {score.overall}/100</div>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>{label}</span>
              <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-line">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-xs text-muted">
        {score.notes.map((note) => (
          <div key={note} className="rounded-md border border-line bg-panel px-3 py-2">
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineBlock({ title, items, note }: { title: string; items: string[]; note: string }) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="text-xs font-semibold uppercase tracking-normal text-muted">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => (
          <span key={item} className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-fg">
            {item}
          </span>
        )) : <span className="text-sm text-muted">No data</span>}
      </div>
      <div className="mt-3 text-sm text-muted">{note}</div>
    </div>
  );
}

function PresetBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft p-4">
      <div className="text-xs font-semibold uppercase tracking-normal text-muted">{title}</div>
      <p className="mt-2 text-sm leading-6 text-fg">{content}</p>
    </div>
  );
}

function SourceStatusGrid({ status }: { status: { youtubeData: string; youtubeSuggest: string; trends: string; notion: string; drive: string } }) {
  const items = [
    ["YouTube Data", status.youtubeData],
    ["YouTube Suggest", status.youtubeSuggest],
    ["Trends", status.trends],
    ["Notion", status.notion],
    ["Drive", status.drive]
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-line bg-panelSoft p-4">
          <div className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</div>
          <SourcePill value={value} />
        </div>
      ))}
    </div>
  );
}

function SourcePill({ value }: { value: string }) {
  const classes =
    value === "live"
      ? "bg-success/15 text-success border-success/30"
      : value === "fallback"
        ? "bg-warning/15 text-warning border-warning/30"
        : value === "missing_key"
          ? "bg-danger/15 text-danger border-danger/30"
          : "bg-panel text-muted border-line";

  const label =
    value === "live"
      ? "Live"
      : value === "fallback"
        ? "Fallback"
        : value === "missing_key"
          ? "Missing Key"
          : "Error";

  return (
    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

function ScoreMetric({ label, score }: { label: string; score: number }) {
  const color = score >= 85 ? "bg-success" : score >= 70 ? "bg-accent" : "bg-warning";
  return (
    <div className="rounded-lg border border-line bg-panelSoft/50 p-3 flex items-center justify-between">
      <div>
        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">{label}</div>
        <div className="mt-1 text-sm font-semibold text-fg">{score}/100</div>
      </div>
      <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden shrink-0 ml-3">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
