import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { PreferencesForm } from "@/components/dashboard/PreferencesForm";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan } from "@/src/lib/plans";
import { getRuntimeConfigGroups, summarizeRuntimeConfig } from "@/src/lib/runtime-config";
import { getUserSettings } from "@/src/lib/user-settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = await getUserPlan(user.id);
  const settings = await getUserSettings(user.id);
  const runtimeConfig = getRuntimeConfigGroups();
  const runtimeSummary = summarizeRuntimeConfig(runtimeConfig);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted">Account, billing, preferences, and API key settings.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Meta label="Email" value={user.email} />
            <Meta label="Name" value={user.name || "Not set"} />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Billing</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Meta label="Current plan" value={plan} />
            <Meta label="Payment provider" value="Lemon Squeezy" />
          </div>
          <Link href="/dashboard/billing" className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong">
            Manage Plan
          </Link>
        </Panel>

      <PreferencesForm
        initialVideoType={settings.defaultVideoType || "Horror Story"}
        initialImageStyle={settings.defaultImageStyle || "Dark Cinematic"}
        initialYoutubeChannelId={settings.youtubeChannelId}
        recentVideoTypes={settings.recentVideoTypes}
        recentImageStyles={settings.recentImageStyles}
      />

        <Panel>
          <h2 className="text-lg font-semibold">API Key</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            API access is reserved for the Pro plan. Keys are not shown until API access is enabled.
          </p>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Runtime readiness</h2>
            <p className="mt-1 text-sm text-muted">
              Quick view of which external systems are configured for real usage.
            </p>
          </div>
          <Link href="/dashboard/diagnostics" className="text-sm text-accent hover:text-accent-strong">
            Open diagnostics
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SmallStat label="Ready" value={runtimeSummary.ready} tone="ready" />
          <SmallStat label="Partial" value={runtimeSummary.partial} tone="partial" />
          <SmallStat label="Missing" value={runtimeSummary.missing} tone="missing" />
        </div>
      </Panel>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right text-fg">{value}</span>
    </div>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: number; tone: "ready" | "partial" | "missing" }) {
  const styles =
    tone === "ready"
      ? "border-success bg-success/10 text-success"
      : tone === "partial"
        ? "border-warning bg-warning/10 text-warning"
        : "border-danger bg-danger/10 text-danger";

  return (
    <div className={`rounded-md border px-4 py-3 ${styles}`}>
      <div className="text-xs uppercase tracking-normal opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
