import { afterEach, describe, expect, it, vi } from "vitest";
import { getRuntimeConfigGroups, summarizeRuntimeConfig } from "../runtime-config";

const envKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "GEMINI_API_KEY",
  "YOUTUBE_API_KEY",
  "NOTION_API_KEY",
  "NOTION_PARENT_PAGE_ID",
  "NOTION_DATABASE_ID",
  "GOOGLE_DRIVE_ACCESS_TOKEN",
  "GOOGLE_DRIVE_REFRESH_TOKEN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "LEMON_SQUEEZY_CHECKOUT_URL_TEMPLATE",
  "LEMON_SQUEEZY_CHECKOUT_URL",
  "LEMON_SQUEEZY_CHECKOUT_URL_CREATOR",
  "LEMON_SQUEEZY_CHECKOUT_URL_PRO",
  "LEMON_SQUEEZY_WEBHOOK_SECRET"
];

describe("runtime config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("summarizes readiness states from env", () => {
    for (const key of envKeys) {
      vi.stubEnv(key, "");
    }
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "pub_test");
    vi.stubEnv("GEMINI_API_KEY", "gemini_test");
    vi.stubEnv("YOUTUBE_API_KEY", "yt_test");
    vi.stubEnv("NOTION_API_KEY", "notion_test");
    vi.stubEnv("NOTION_DATABASE_ID", "db_test");
    vi.stubEnv("GOOGLE_DRIVE_REFRESH_TOKEN", "refresh_test");
    vi.stubEnv("GOOGLE_CLIENT_ID", "client_test");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret_test");
    vi.stubEnv("LEMON_SQUEEZY_CHECKOUT_URL_TEMPLATE", "https://checkout.example.com?plan={{plan}}");
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "hook_test");

    const groups = getRuntimeConfigGroups();
    const summary = summarizeRuntimeConfig(groups);

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.ready).toBeGreaterThan(0);
    expect(summary.partial).toBeGreaterThanOrEqual(0);
    expect(groups.find((group) => group.title === "Auth")?.checks.every((check) => check.health === "ready")).toBe(true);
  });
});
