"use client";

import { Image, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { CopyButton } from "./CopyButton";
import type { ScenePrompt } from "@/src/lib/types";
import { Button } from "@/components/ui/Button";

export function ScenePromptCard({
  scene,
  editing,
  regenerating,
  onDelete,
  onEdit,
  onRegenerate,
  onToggleEdit
}: {
  scene: ScenePrompt;
  editing?: boolean;
  regenerating?: boolean;
  onDelete?: () => void;
  onEdit?: (nextPrompt: string) => void;
  onRegenerate?: () => void;
  onToggleEdit?: () => void;
}) {
  return (
    <article className="rounded-lg border border-violet-500/30 bg-panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="inline-flex rounded-md bg-accent px-2 py-1 text-xs font-semibold">
            Scene {scene.sceneRange}
          </div>
          <div className="mt-2 text-xs text-muted">{scene.timestamp}</div>
        </div>
        <div className="flex gap-2">
          <CopyButton text={scene.imagePrompt} label="Copy Prompt" />
          <CopyButton text={scene.summary} label="Copy Summary" />
          <Button type="button" variant="ghost" size="icon" title="Edit" onClick={onToggleEdit}>
            <Pencil size={15} />
          </Button>
          <Button type="button" variant="ghost" size="icon" title="Regenerate" onClick={onRegenerate} disabled={regenerating}>
            <RotateCcw className={regenerating ? "animate-spin" : ""} size={15} />
          </Button>
          <Button type="button" variant="ghost" size="icon" title="Delete" onClick={onDelete}>
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
            <span>Summary</span>
            <span className="rounded-full bg-panelSoft px-2 py-1 normal-case text-fg">{scene.beat}</span>
          </div>
          <p className="text-sm leading-6 text-fg">{scene.summary}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Meta label="Camera" value={scene.cameraAngle} />
          <Meta label="Lighting" value={scene.lighting} />
          <Meta label="Emotion" value={scene.emotion} />
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
            <Image size={14} />
            Image Prompt
          </div>
          {editing ? (
            <textarea
              value={scene.imagePrompt}
              onChange={(event) => onEdit?.(event.target.value)}
              className="min-h-32 w-full resize-y rounded-md border border-line bg-panelSoft p-3 text-sm leading-6 text-fg focus-ring"
            />
          ) : (
            <p className="text-sm leading-6 text-fg">{scene.imagePrompt}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panelSoft p-3">
      <div className="text-[11px] uppercase tracking-normal text-muted">{label}</div>
      <div className="mt-1 text-sm text-fg">{value}</div>
    </div>
  );
}
