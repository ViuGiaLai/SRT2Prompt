import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan } from "@/src/lib/plans";

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = await getUserPlan(user.id);

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
            <Meta label="Payment provider" value="Stripe ready" />
          </div>
          <Link href="/dashboard/pricing" className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
            Manage Plan
          </Link>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Preferences</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Meta label="Default language" value="English" />
            <Meta label="Default video type" value="Horror Story" />
            <Meta label="Default image style" value="Dark Cinematic" />
            <Meta label="Default output format" value={plan === "Pro" ? "JSON" : plan === "Creator" ? "Markdown" : "Copy"} />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">API Key</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            API access is reserved for the Pro plan. Keys are not shown until API access is enabled.
          </p>
        </Panel>
      </div>
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
