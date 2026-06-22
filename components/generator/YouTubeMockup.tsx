import React, { useState } from "react";
import { Copy, Eye, Clock, Laptop, Smartphone, Check } from "lucide-react";

interface YouTubeMockupProps {
  title: string;
  thumbnailText: string;
  channelName: string;
  views?: string;
  timeAgo?: string;
  availableTitles?: string[];
  onTitleChange: (title: string) => void;
  onThumbnailTextChange: (text: string) => void;
  onChannelNameChange: (name: string) => void;
}

export function YouTubeMockup({
  title,
  thumbnailText,
  channelName,
  views = "18K",
  timeAgo = "3 hours ago",
  availableTitles = [],
  onTitleChange,
  onThumbnailTextChange,
  onChannelNameChange,
}: YouTubeMockupProps) {
  const [layoutMode, setLayoutMode] = useState<"mobile" | "desktop">("mobile");
  const [mockViews, setMockViews] = useState(views);
  const [mockTimeAgo, setMockTimeAgo] = useState(timeAgo);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to split thumbnail overlay text into separate badge/lines
  const renderThumbnailText = (text: string) => {
    if (!text.trim()) return null;
    
    // Split by newlines or comma or slash to create multiple text badges
    const lines = text.split(/[\n,;]|\s{2,}/).map(l => l.trim()).filter(Boolean);
    
    return (
      <div className="absolute inset-0 p-4 flex flex-col justify-center items-center pointer-events-none select-none">
        {lines.map((line, i) => (
          <div
            key={i}
            className="my-1 px-3 py-1.5 bg-black/90 text-yellow-400 font-extrabold text-lg md:text-xl tracking-tighter uppercase border-2 border-yellow-400/80 rounded shadow-2xl rotate-[-2deg] select-none text-center max-w-[90%] break-words"
            style={{
              textShadow: "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000"
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-line bg-panel p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/40 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-fg uppercase tracking-wider text-muted">
            Live YouTube Mockup Preview
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Visualize how your video appears in real YouTube feeds. Screenshot this to share or test!
          </p>
        </div>
        
        {/* Layout Switcher */}
        <div className="inline-flex rounded-md bg-panelSoft p-0.5 border border-line">
          <button
            onClick={() => setLayoutMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              layoutMode === "mobile"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-fg"
            }`}
          >
            <Smartphone size={13} />
            Mobile Feed
          </button>
          <button
            onClick={() => setLayoutMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              layoutMode === "desktop"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-fg"
            }`}
          >
            <Laptop size={13} />
            Desktop Search
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Preview Panel */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-panelSoft/30 rounded-lg border border-line/50 p-4 min-h-[300px]">
          {layoutMode === "mobile" ? (
            /* Mobile Layout Mockup */
            <div className="w-full max-w-sm rounded-xl overflow-hidden border border-line bg-black shadow-2xl animate-fadeIn">
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-red-950/60 overflow-hidden flex items-center justify-center">
                {/* Spooky Horror corridor effect placeholder */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,rgba(0,0,0,0.95)_100%)]" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {/* Horizontal warning bar */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-bold text-[8px] uppercase tracking-wider">
                  Live Preview
                </div>

                {/* Text Overlay */}
                {renderThumbnailText(thumbnailText)}

                {/* Video Duration Badge */}
                <div className="absolute bottom-2 right-2 rounded bg-black/85 text-[10px] font-semibold text-white px-1.5 py-0.5">
                  12:45
                </div>
              </div>

              {/* Feed Card Info */}
              <div className="p-3 flex gap-3 bg-neutral-950">
                {/* Spooky Red Avatar */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-950 border border-red-500/30 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-inner select-none">
                  {channelName.charAt(0) || "R"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white leading-5 line-clamp-2 break-words">
                    {title || "Untitled Video"}
                  </h4>
                  <div className="mt-1 text-xs text-neutral-400 font-medium flex flex-wrap items-center gap-1">
                    <span>{channelName}</span>
                    <span className="text-neutral-600">•</span>
                    <span>{mockViews} views</span>
                    <span className="text-neutral-600">•</span>
                    <span>{mockTimeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout Mockup */
            <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-line bg-neutral-950 p-4 shadow-2xl flex flex-col sm:flex-row gap-4 animate-fadeIn">
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full sm:w-60 bg-gradient-to-br from-neutral-900 via-neutral-950 to-red-950/60 overflow-hidden flex items-center justify-center shrink-0 rounded-lg">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,rgba(0,0,0,0.95)_100%)]" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {/* Warning stamp */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-bold text-[8px] uppercase tracking-wider">
                  Live Preview
                </div>

                {/* Text Overlay */}
                {renderThumbnailText(thumbnailText)}

                {/* Video Duration Badge */}
                <div className="absolute bottom-2 right-2 rounded bg-black/85 text-[10px] font-semibold text-white px-1.5 py-0.5">
                  12:45
                </div>
              </div>

              {/* Feed Card Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1 bg-neutral-950">
                <div>
                  <h4 className="text-base font-semibold text-white leading-5 line-clamp-2 break-words">
                    {title || "Untitled Video"}
                  </h4>
                  <div className="mt-1 text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                    <span>{mockViews} views</span>
                    <span className="text-neutral-600">•</span>
                    <span>{mockTimeAgo}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {/* Channel icon */}
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-red-600 to-rose-950 border border-red-500/30 flex items-center justify-center text-white font-bold text-[10px] shadow-inner select-none">
                    {channelName.charAt(0) || "R"}
                  </div>
                  <span className="text-xs text-neutral-400 font-semibold">{channelName}</span>
                </div>

                {/* Spooky description snippet */}
                <p className="mt-2 text-[11px] text-neutral-500 line-clamp-1 leading-normal">
                  You are about to experience the terrifying secrets of the night shift... WARNING: Do not listen alone in the dark.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Controls Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-fg uppercase tracking-wider text-muted">
              Mockup Settings
            </h4>
            <p className="text-[11px] text-muted mt-0.5">
              Tweak properties to test CTR attractiveness in real time.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Title Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-muted tracking-wider">
                  Video Title
                </label>
                <button
                  onClick={handleCopy}
                  className="text-[10px] text-accent hover:underline flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check size={10} className="text-success" />
                      <span className="text-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span>Copy title</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full h-16 rounded border border-line bg-panelSoft p-2 text-xs focus-ring text-fg leading-normal"
                placeholder="Enter mockup video title..."
              />
            </div>

            {/* Thumbnail Overlay Text */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted tracking-wider">
                Thumbnail Overlay Text
              </label>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => onThumbnailTextChange(e.target.value)}
                className="w-full h-8 rounded border border-line bg-panelSoft px-2 text-xs focus-ring text-fg"
                placeholder="Thumbnail text... (e.g. RULE #7)"
              />
              <p className="text-[9px] text-muted">
                Separate lines using commas or double-spaces.
              </p>
            </div>

            {/* Channel Info Row */}
            <div className="grid gap-2 grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted tracking-wider">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => onChannelNameChange(e.target.value)}
                  className="w-full h-8 rounded border border-line bg-panelSoft px-2 text-xs focus-ring text-fg"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted tracking-wider">
                  Views Counter
                </label>
                <input
                  type="text"
                  value={mockViews}
                  onChange={(e) => setMockViews(e.target.value)}
                  className="w-full h-8 rounded border border-line bg-panelSoft px-2 text-xs focus-ring text-fg"
                />
              </div>
            </div>

            {/* Time Ago Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted tracking-wider">
                Published Time
              </label>
              <input
                type="text"
                value={mockTimeAgo}
                onChange={(e) => setMockTimeAgo(e.target.value)}
                className="w-full h-8 rounded border border-line bg-panelSoft px-2 text-xs focus-ring text-fg"
              />
            </div>

            {/* Quick-Fill Titles Selector */}
            {availableTitles.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-line/40">
                <label className="block text-[10px] font-bold uppercase text-muted tracking-wider">
                  Quick Fill Title Choices
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {availableTitles.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => onTitleChange(t)}
                      className={`w-full text-left p-1.5 rounded text-[11px] border leading-normal transition truncate block ${
                        title === t
                          ? "bg-accent/10 border-accent text-accent font-semibold"
                          : "bg-panelSoft/50 hover:bg-panelSoft border-line/50 text-muted hover:text-fg"
                      }`}
                    >
                      {idx + 1}. {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
