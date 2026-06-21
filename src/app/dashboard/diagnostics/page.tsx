import { CheckCircle2, CircleAlert, Database, Rocket, ShieldAlert } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getRuntimeConfigGroups, summarizeRuntimeConfig } from "@/src/lib/runtime-config";

export default async function DiagnosticsPage() {
  await requireUser();
  const groups = getRuntimeConfigGroups();
  const summary = summarizeRuntimeConfig(groups);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Diagnostics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            This view shows which systems are ready, which are partially wired, and which still need keys.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Metric label="Ready" value={summary.ready} tone="ready" />
          <Metric label="Partial" value={summary.partial} tone="partial" />
          <Metric label="Missing" value={summary.missing} tone="missing" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Panel key={group.title} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panelSoft">
                {group.title === "Auth" ? (
                  <ShieldAlert size={18} className="text-accent" />
                ) : group.title === "AI Pipeline" ? (
                  <Rocket size={18} className="text-accent" />
                ) : group.title === "Exports" ? (
                  <Database size={18} className="text-accent" />
                ) : (
                  <CheckCircle2 size={18} className="text-accent" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <p className="mt-1 text-sm text-muted">{group.summary}</p>
              </div>
            </div>

            <div className="space-y-3">
              {group.checks.map((check) => (
                <div key={check.key} className="rounded-md border border-line bg-panelSoft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-fg">{check.label}</div>
                      <p className="mt-1 text-xs leading-5 text-muted">{check.note}</p>
                    </div>
                    <HealthPill health={check.health} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "ready" | "partial" | "missing" }) {
  const styles =
    tone === "ready"
      ? "border-success bg-success/10 text-success"
      : tone === "partial"
        ? "border-warning bg-warning/10 text-warning"
        : "border-danger bg-danger/10 text-danger";

  return (
    <div className={`rounded-md border px-4 py-3 text-left ${styles}`}>
      <div className="text-xs uppercase tracking-normal opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function HealthPill({ health }: { health: "ready" | "partial" | "missing" }) {
  if (health === "ready") {
    return <span className="rounded-full border border-success bg-success/10 px-2.5 py-1 text-xs font-medium text-success">Ready</span>;
  }

  if (health === "partial") {
    return <span className="rounded-full border border-warning bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">Partial</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-danger bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
      <CircleAlert size={12} />
      Missing
    </span>
  );
}
