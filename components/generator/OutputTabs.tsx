"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { exportAsCsv, exportAsMarkdown, exportAsText } from "@/src/lib/export";
import { PLAN_LIMITS } from "@/src/lib/plan-config";
import type { ContentPack, PlanName } from "@/src/lib/types";
import { CopyButton } from "./CopyButton";
import { ScenePromptCard } from "./ScenePromptCard";

const tabs = ["Overview", "Scene Prompts", "Thumbnail", "Titles", "Description", "Hashtags", "Export"] as const;

export function OutputTabs({ pack, plan = "Free", projectId }: { pack: ContentPack | null; plan?: PlanName; projectId?: string }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");
  const [currentPack, setCurrentPack] = useState<ContentPack | null>(pack);
  const [editingScene, setEditingScene] = useState("");
  const [regeneratingScene, setRegeneratingScene] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [notice, setNotice] = useState("");
  const visibleTabs = useMemo(() => getVisibleTabs(currentPack, plan), [currentPack, plan]);
  const textExport = useMemo(() => (currentPack ? exportAsText(currentPack) : ""), [currentPack]);
  const markdownExport = useMemo(() => (currentPack ? exportAsMarkdown(currentPack) : ""), [currentPack]);
  const csvExport = useMemo(() => (currentPack ? exportAsCsv(currentPack) : ""), [currentPack]);
  const exportFormats = PLAN_LIMITS[plan].exportFormats;

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
        body: JSON.stringify({ contentPack: currentPack })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save changes.");
      setNotice("Changes saved.");
    } finally {
      setSavingChanges(false);
    }
  }

  return (
    <Panel>
      {projectId && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-panelSoft p-3">
          <span className="text-sm text-muted">{notice || "Edit scene prompts, description, or titles, then save changes."}</span>
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
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setCurrentPack((current) =>
                current
                  ? {
                      ...current,
                      titles: current.titles.map((title) =>
                        title.endsWith("?") ? title : `${title.replace(/\.$/, "")}?`
                      )
                    }
                  : current
              )
            }
          >
            Rewrite Titles
          </Button>
          {currentPack.titles.map((title, index) => (
            <div key={title} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-panelSoft p-3">
              <div>
                <div className="text-xs text-muted">Title {index + 1}</div>
                <div className="text-sm font-medium">{title}</div>
              </div>
              <CopyButton text={title} />
            </div>
          ))}
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
