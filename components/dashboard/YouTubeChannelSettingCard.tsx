"use client";

import { useState } from "react";
import { Check, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  initialValue: string;
};

export function YouTubeChannelSettingCard({ initialValue }: Props) {
  const [youtubeChannelId, setYoutubeChannelId] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeChannelId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save channel setting.");
      setYoutubeChannelId(data.settings?.youtubeChannelId || "");
      setNotice("Saved. The generator will use this channel when analyzing YouTube data.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save channel setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panelSoft">
          <Search size={18} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">YouTube focus channel</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Optional. Leave blank to analyze broad YouTube search signals. Enter a channel ID to focus competitor and title analysis on one specific channel.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-fg">YouTube Channel ID</span>
          <input
            className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
            type="text"
            value={youtubeChannelId}
            onChange={(event) => setYoutubeChannelId(event.target.value)}
            placeholder="UCxxxxxxxxxxxxxxxx"
          />
        </label>
        <div className="rounded-md border border-line bg-panelSoft p-3 text-xs leading-5 text-muted">
          If this field is empty, SRT2Prompt uses general YouTube signals. If you enter a channel ID, the app narrows analysis to that channel on supported APIs.
        </div>
        {notice && (
          <div className="rounded-md border border-success bg-success/10 p-3 text-sm text-success">
            <Check className="mr-2 inline-block align-[-2px]" size={16} />
            {notice}
          </div>
        )}
        {error && <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">{error}</div>}
        <Button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2">
          <Save size={16} />
          {saving ? "Saving..." : "Save Channel"}
        </Button>
      </div>
    </div>
  );
}
