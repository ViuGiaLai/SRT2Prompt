import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { UserSettings } from "./types";

const localSettingsPath = path.join(process.cwd(), "data", "user-settings.json");

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const all = await readUserSettings();
  return normalizeSettings(all[userId]);
}

export async function setUserSettings(userId: string, settings: Partial<UserSettings>) {
  const all = await readUserSettings();
  const current = normalizeSettings(all[userId]);
  const next = normalizeSettings({ ...current, ...settings });
  all[userId] = next;
  await writeUserSettings(all);
  return next;
}

function normalizeSettings(settings?: Partial<UserSettings> | null): UserSettings {
  const defaultVideoType = String(settings?.defaultVideoType || "").trim();
  const defaultImageStyle = String(settings?.defaultImageStyle || "").trim();
  const youtubeChannelId = String(settings?.youtubeChannelId || "").trim();
  const recentVideoTypes = uniqueRecent([
    defaultVideoType,
    ...(settings?.recentVideoTypes || [])
  ]);
  const recentImageStyles = uniqueRecent([
    defaultImageStyle,
    ...(settings?.recentImageStyles || [])
  ]);

  return {
    defaultVideoType,
    defaultImageStyle,
    youtubeChannelId,
    recentVideoTypes,
    recentImageStyles
  };
}

function uniqueRecent(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 5);
}

async function readUserSettings(): Promise<Record<string, UserSettings>> {
  try {
    const content = await readFile(localSettingsPath, "utf8");
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeUserSettings(state: Record<string, UserSettings>) {
  await mkdir(path.dirname(localSettingsPath), { recursive: true });
  await writeFile(localSettingsPath, JSON.stringify(state, null, 2), "utf8");
}
