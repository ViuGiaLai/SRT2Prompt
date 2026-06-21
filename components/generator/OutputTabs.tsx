"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, FileJson, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { exportAsCsv, exportAsMarkdown, exportAsText, exportForTaoAnhAI } from "@/src/lib/export";
import { PLAN_LIMITS } from "@/src/lib/plan-config";
import type { ContentPack, PlanName } from "@/src/lib/types";
import { CopyButton } from "./CopyButton";
import { ScenePromptCard } from "./ScenePromptCard";

const tabs = ["Overview", "Intelligence", "Character Bible", "Storyboard", "Scene Prompts", "Thumbnail", "Titles", "Description", "Hashtags", "Export"] as const;

export function OutputTabs({ pack, plan = "Free", projectId }: { pack: ContentPack | null; plan?: PlanName; projectId?: string }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");
  const [currentPack, setCurrentPack] = useState<ContentPack | null>(pack);
  const [editingScene, setEditingScene] = useState("");
  const [regeneratingScene, setRegeneratingScene] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [notice, setNotice] = useState("");
  const [extensionDetected, setExtensionDetected] = useState(false);
  const visibleTabs = useMemo(() => getVisibleTabs(currentPack, plan), [currentPack, plan]);
  const textExport = useMemo(() => (currentPack ? exportAsText(currentPack) : ""), [currentPack]);
  const markdownExport = useMemo(() => (currentPack ? exportAsMarkdown(currentPack) : ""), [currentPack]);
  const csvExport = useMemo(() => (currentPack ? exportAsCsv(currentPack) : ""), [currentPack]);
  const taoAnhAIExport = useMemo(() => (currentPack ? exportForTaoAnhAI(currentPack) : ""), [currentPack]);
  const exportFormats = PLAN_LIMITS[plan].exportFormats;
  const taoAnhAIDownloadUrl = process.env.NEXT_PUBLIC_TAOANH_AI_DOWNLOAD_URL?.trim() || "";

  useEffect(() => {
    setCurrentPack(pack);
    setActive("Overview");
    setEditingScene("");
    setRegeneratingScene("");
  }, [pack]);

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

  if (!currentPack) {
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

  function updateScene(sceneRange: string, timestamp: string, imagePrompt: string) {
    setCurrentPack((current) =>
      current
        ? {
            ...current,
            scenePrompts: current.scenePrompts.map((scene) =>
              scene.sceneRange === sceneRange && scene.timestamp === timestamp
                ? { ...scene, imagePrompt }
                : scene
            )
          }
        : current
    );
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
          language: currentPack.language
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
    if (!currentPack) return;
    const prompts = [
      currentPack.thumbnail.prompt,
      ...currentPack.scenePrompts.map((scene) => scene.imagePrompt)
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
    if (!currentPack?.thumbnail.prompt.trim()) return;
    window.postMessage(
      {
        type: "TAO_ANH_AI_IMPORT_QUEUE",
        payload: { prompts: [currentPack.thumbnail.prompt.trim()] }
      },
      window.location.origin
    );
  }

  async function sendScenesOnly() {
    if (!currentPack) return;
    const prompts = currentPack.scenePrompts.map((scene) => scene.imagePrompt.trim()).filter(Boolean);
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
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard label="Name" value={currentPack.characterBible.name} />
          <SummaryCard label="Age" value={currentPack.characterBible.age} />
          <SummaryCard label="Gender" value={currentPack.characterBible.gender} />
          <SummaryCard label="Hair" value={currentPack.characterBible.hair} />
          <SummaryCard label="Clothes" value={currentPack.characterBible.clothes} />
          <SummaryCard label="Personality" value={currentPack.characterBible.personality} />
          <div className="sm:col-span-2">
            <SummaryCard label="Consistency Notes" value={currentPack.characterBible.consistencyNotes} />
          </div>
        </div>
      )}

      {active === "Storyboard" && (
        <div className="space-y-4">
          {currentPack.storyboard.map((scene) => (
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
          {currentPack.scenePrompts.map((scene) => (
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
            />
          ))}
        </div>
      )}

      {active === "Thumbnail" && (
        <div className="space-y-4">
          <OutputBlock title="Thumbnail Prompt" content={currentPack.thumbnail.prompt} />
          <OutputBlock title="Text Overlay" content={currentPack.thumbnail.textOverlay} />
          <OutputBlock title="Composition Notes" content={currentPack.thumbnail.compositionNotes} />
          <CopyButton text={currentPack.thumbnail.prompt} label="Copy Thumbnail Prompt" />
        </div>
      )}

      {active === "Titles" && (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <TitleGroupCard title="Curiosity" titles={currentPack.titlePack.curiosity} />
            <TitleGroupCard title="Fear" titles={currentPack.titlePack.fear} />
            <TitleGroupCard title="Question" titles={currentPack.titlePack.question} />
            <TitleGroupCard title="Clickbait" titles={currentPack.titlePack.clickbait} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={currentPack.titles.join("\n")} label="Copy All Titles" />
            <CopyButton text={currentPack.titlePack.curiosity.join("\n")} label="Copy Curiosity" />
            <CopyButton text={currentPack.titlePack.fear.join("\n")} label="Copy Fear" />
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
            {currentPack.hashtags.map((tag) => (
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
