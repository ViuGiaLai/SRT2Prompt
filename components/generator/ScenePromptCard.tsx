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
  onToggleEdit,
  onUpdateMetadata
}: {
  scene: ScenePrompt;
  editing?: boolean;
  regenerating?: boolean;
  onDelete?: () => void;
  onEdit?: (nextPrompt: string) => void;
  onRegenerate?: () => void;
  onToggleEdit?: () => void;
  onUpdateMetadata?: (field: "cameraAngle" | "lighting" | "emotion", value: string) => void;
}) {
  const cameraAngles = [
    "Wide shot",
    "Wide establishing shot",
    "Medium establishing shot",
    "Over-the-shoulder shot",
    "Medium shot",
    "Low angle shot",
    "High angle shot",
    "Dramatic close-up",
    "Dutch angle",
    "Tight cinematic shot",
    "Wide emotional pullback",
    "Soft close-up",
    "Extreme close-up"
  ];

  const lightingStyles = [
    "Moody cinematic lighting",
    "Moody cinematic shadow lighting",
    "High-contrast horror lighting",
    "Dramatic cinematic lighting",
    "Clean cinematic lighting",
    "Warm volumetric golden hour lighting",
    "Cold fluorescent laboratory lighting",
    "Neon synthwave lighting",
    "Soft overcast day lighting",
    "Pitch black darkness with flashlight beam"
  ];

  const emotions = [
    "Tense",
    "Intense",
    "Curious",
    "Resolved",
    "Frightened",
    "Shocked",
    "Excited",
    "Melancholy",
    "Mysterious",
    "Angry",
    "Terrified"
  ];

  const cameraOptions = cameraAngles.includes(scene.cameraAngle || "")
    ? cameraAngles
    : [scene.cameraAngle || "Wide shot", ...cameraAngles];

  const lightingOptions = lightingStyles.includes(scene.lighting || "")
    ? lightingStyles
    : [scene.lighting || "Moody cinematic lighting", ...lightingStyles];

  const emotionOptions = emotions.includes(scene.emotion || "")
    ? emotions
    : [scene.emotion || "Tense", ...emotions];

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
          <div className="rounded-md border border-line bg-panelSoft p-2.5">
            <label className="block text-[10px] uppercase font-semibold text-muted tracking-wider">
              Camera Angle
            </label>
            <select
              value={scene.cameraAngle || "Wide shot"}
              disabled={regenerating}
              onChange={(e) => onUpdateMetadata?.("cameraAngle", e.target.value)}
              className="mt-1 block w-full rounded-md border-0 bg-transparent py-1 px-0 text-xs font-semibold text-fg focus:ring-0 cursor-pointer disabled:opacity-50"
            >
              {cameraOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-panel text-fg">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md border border-line bg-panelSoft p-2.5">
            <label className="block text-[10px] uppercase font-semibold text-muted tracking-wider">
              Lighting
            </label>
            <select
              value={scene.lighting || "Moody cinematic lighting"}
              disabled={regenerating}
              onChange={(e) => onUpdateMetadata?.("lighting", e.target.value)}
              className="mt-1 block w-full rounded-md border-0 bg-transparent py-1 px-0 text-xs font-semibold text-fg focus:ring-0 cursor-pointer disabled:opacity-50"
            >
              {lightingOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-panel text-fg">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md border border-line bg-panelSoft p-2.5">
            <label className="block text-[10px] uppercase font-semibold text-muted tracking-wider">
              Emotion
            </label>
            <select
              value={scene.emotion || "Tense"}
              disabled={regenerating}
              onChange={(e) => onUpdateMetadata?.("emotion", e.target.value)}
              className="mt-1 block w-full rounded-md border-0 bg-transparent py-1 px-0 text-xs font-semibold text-fg focus:ring-0 cursor-pointer disabled:opacity-50"
            >
              {emotionOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-panel text-fg">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
            <Image size={14} />
            Image Prompt
          </div>
          {editing ? (
            <textarea
              value={scene.summary}
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
