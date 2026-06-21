"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IMAGE_STYLES, VIDEO_TYPES } from "@/src/lib/constants";

type Props = {
  initialVideoType: string;
  initialImageStyle: string;
  initialYoutubeChannelId: string;
  recentVideoTypes: string[];
  recentImageStyles: string[];
};

export function PreferencesForm({
  initialVideoType,
  initialImageStyle,
  initialYoutubeChannelId,
  recentVideoTypes,
  recentImageStyles
}: Props) {
  const [defaultVideoType, setDefaultVideoType] = useState(initialVideoType);
  const [defaultImageStyle, setDefaultImageStyle] = useState(initialImageStyle);
  const [youtubeChannelId, setYoutubeChannelId] = useState(initialYoutubeChannelId);
  const [recentVideos, setRecentVideos] = useState(recentVideoTypes);
  const [recentStyles, setRecentStyles] = useState(recentImageStyles);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  async function save(message = "Saved. These values will prefill the generator for new projects.") {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultVideoType, defaultImageStyle, youtubeChannelId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save preferences.");
      setNotice(message);
      setRecentVideos((current) => uniqueRecent([defaultVideoType, ...current]));
      setRecentStyles((current) => uniqueRecent([defaultImageStyle, ...current]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void save("Auto-saved. These values will prefill the generator for new projects.");
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [defaultVideoType, defaultImageStyle, youtubeChannelId]);

  function resetDefaults() {
    setDefaultVideoType("Horror Story");
    setDefaultImageStyle("Dark Cinematic");
    setYoutubeChannelId("");
    setRecentVideos((current) => uniqueRecent(["Horror Story", ...current]));
    setRecentStyles((current) => uniqueRecent(["Dark Cinematic", ...current]));
    setNotice("Reset to app defaults. Save to apply them.");
    setError("");
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panelSoft">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Enter your own default video type or image style, or pick from the suggestions. This is not a paid feature.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-fg">Default Video Type</span>
          <input
            className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
            list="video-type-options"
            value={defaultVideoType}
            onChange={(event) => setDefaultVideoType(event.target.value)}
            placeholder="e.g. Horror Story, Tutorial, Vlog"
          />
          <datalist id="video-type-options">
            {VIDEO_TYPES.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>

        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium text-fg">Recent Video Types</div>
          <div className="flex flex-wrap gap-2">
            {recentVideos.length > 0 ? recentVideos.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDefaultVideoType(item)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  defaultVideoType === item ? "border-accent bg-accent text-white" : "border-line bg-panelSoft text-muted hover:text-fg"
                }`}
              >
                {item}
              </button>
            )) : <span className="text-xs text-muted">No recent values yet.</span>}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-fg">Default Image Style</span>
          <input
            className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
            list="image-style-options"
            value={defaultImageStyle}
            onChange={(event) => setDefaultImageStyle(event.target.value)}
            placeholder="e.g. Dark Cinematic, Clean Minimal"
          />
          <datalist id="image-style-options">
            {IMAGE_STYLES.map((item) => (
              <option key={item.value} value={item.value} />
            ))}
          </datalist>
        </label>

        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium text-fg">Recent Image Styles</div>
          <div className="flex flex-wrap gap-2">
            {recentStyles.length > 0 ? recentStyles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDefaultImageStyle(item)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  defaultImageStyle === item ? "border-accent bg-accent text-white" : "border-line bg-panelSoft text-muted hover:text-fg"
                }`}
              >
                {item}
              </button>
            )) : <span className="text-xs text-muted">No recent values yet.</span>}
          </div>
        </div>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-medium text-fg">YouTube Channel ID</span>
          <input
            className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
            type="text"
            value={youtubeChannelId}
            onChange={(event) => setYoutubeChannelId(event.target.value)}
            placeholder="Optional. Leave blank to use broad YouTube signals."
          />
        </label>
      </div>

      <div className="mt-3 rounded-md border border-line bg-panelSoft p-3 text-xs leading-5 text-muted">
        Choose a preset or type your own. These settings only control the default values shown in the generator and do not affect billing.
      </div>

      {notice && (
        <div className="mt-3 rounded-md border border-success bg-success/10 p-3 text-sm text-success">
          <Check className="mr-2 inline-block align-[-2px]" size={16} />
          {notice}
        </div>
      )}
      {error && <div className="mt-3 rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">{error}</div>}

      <div className="mt-4">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={resetDefaults} disabled={saving} className="inline-flex items-center gap-2">
            Reset to Defaults
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2">
            <Save size={16} />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function uniqueRecent(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 5);
}
