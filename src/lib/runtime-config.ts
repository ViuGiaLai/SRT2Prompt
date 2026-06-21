export type ConfigHealth = "ready" | "partial" | "missing";

export type ConfigCheck = {
  key: string;
  label: string;
  health: ConfigHealth;
  note: string;
};

export type ConfigGroup = {
  title: string;
  summary: string;
  checks: ConfigCheck[];
};

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() && !value.includes("[YOUR-") && !value.includes("YOUR_"));
}

function maybe(value: string | undefined) {
  return hasValue(value) ? "ready" : "missing";
}

function partialOrReady(required: boolean, fallbackAvailable: boolean) {
  if (required) return "ready" as const;
  return fallbackAvailable ? "partial" : "missing";
}

export function getRuntimeConfigGroups(): ConfigGroup[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const notionKey = process.env.NOTION_API_KEY;
  const notionParentPageId = process.env.NOTION_PARENT_PAGE_ID;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;
  const driveAccessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const driveClientId = process.env.GOOGLE_CLIENT_ID;
  const driveClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const lemonCheckout = process.env.LEMON_SQUEEZY_CHECKOUT_URL_TEMPLATE || process.env.LEMON_SQUEEZY_CHECKOUT_URL || process.env.LEMON_SQUEEZY_CHECKOUT_URL_CREATOR || process.env.LEMON_SQUEEZY_CHECKOUT_URL_PRO;
  const lemonWebhook = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  return [
    {
      title: "Auth",
      summary: "Supabase auth powers login, Google OAuth, and protected dashboard sessions.",
      checks: [
        {
          key: "supabase-url",
          label: "Supabase URL",
          health: maybe(supabaseUrl),
          note: "Required for email/password and Google OAuth redirects."
        },
        {
          key: "supabase-key",
          label: "Supabase publishable key",
          health: maybe(supabaseKey),
          note: "Required for client-auth and session exchange."
        }
      ]
    },
    {
      title: "AI Pipeline",
      summary: "The generator falls back gracefully, but live scoring is strongest with keys configured.",
      checks: [
        {
          key: "gemini",
          label: "Gemini API",
          health: maybe(geminiKey),
          note: "Required for full content generation."
        },
        {
          key: "youtube",
          label: "YouTube Data API",
          health: maybe(youtubeKey),
          note: "Used for title and competitor signals."
        }
      ]
    },
    {
      title: "Exports",
      summary: "Notion and Drive stay optional, but should be configured before real users rely on export.",
      checks: [
        {
          key: "notion",
          label: "Notion API key",
          health: partialOrReady(hasValue(notionKey), hasValue(notionParentPageId) || hasValue(notionDatabaseId)),
          note: "Needs a page or database target to create exports."
        },
        {
          key: "drive",
          label: "Google Drive access",
          health: partialOrReady(hasValue(driveAccessToken), hasValue(driveRefreshToken) && hasValue(driveClientId) && hasValue(driveClientSecret)),
          note: "Can use a direct access token or a refresh-token flow."
        }
      ]
    },
    {
      title: "Billing",
      summary: "Lemon Squeezy handles checkout, webhook updates, and customer management links.",
      checks: [
        {
          key: "lemon-checkout",
          label: "Checkout URL",
          health: maybe(lemonCheckout),
          note: "Needed to redirect users into Lemon Squeezy checkout."
        },
        {
          key: "lemon-webhook",
          label: "Webhook secret",
          health: partialOrReady(hasValue(lemonWebhook), Boolean(lemonCheckout)),
          note: "Used to verify subscription updates."
        }
      ]
    }
  ];
}

export function summarizeRuntimeConfig(groups: ConfigGroup[]) {
  const checks = groups.flatMap((group) => group.checks);
  const ready = checks.filter((check) => check.health === "ready").length;
  const partial = checks.filter((check) => check.health === "partial").length;
  const missing = checks.filter((check) => check.health === "missing").length;

  return {
    ready,
    partial,
    missing,
    total: checks.length
  };
}
