import Link from "next/link";
import { ClipboardPaste, FileUp, Languages, Skull, Sparkles } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";
import { getUsage, listGenerations } from "@/src/lib/plans";

const actions = [
  { label: "Paste Script", icon: ClipboardPaste },
  { label: "Upload SRT", icon: FileUp },
  { label: "Create Horror Story Pack", icon: Skull },
  { label: "Translate Subtitle", icon: Languages }
];

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id).catch(() => []);
  const usage = await getUsage(user.id, projects.length);
  const generations = await listGenerations(user.id, 5);
  const generationLabel =
    usage.dailyLimit !== null
      ? `${usage.dailyGenerations} / ${usage.dailyLimit} today`
      : usage.monthlyLimit !== null
        ? `${usage.monthlyGenerations} / ${usage.monthlyLimit} this month`
        : "Unlimited";

  return (
    <div className="space-y-6">
      <Panel className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {user.name || user.email}</h1>
          <p className="mt-2 text-muted">Ready to turn your next script into a video content pack?</p>
        </div>
        <Link href="/dashboard/generate" className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500">
          <Sparkles size={17} />
          Generate New Pack
        </Link>
      </Panel>

      <div className="grid gap-4 md:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href="/dashboard/generate" className="rounded-lg border border-line bg-panel p-5 transition hover:border-accent">
              <Icon className="mb-4 text-accent" size={24} />
              <div className="font-medium">{action.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel>
          <h2 className="mb-4 text-lg font-semibold">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted">No saved projects yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <div className="grid grid-cols-4 bg-panelSoft p-3 text-xs font-medium uppercase tracking-normal text-muted">
                <div>Project name</div>
                <div>Type</div>
                <div>Style</div>
                <div>Action</div>
              </div>
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="grid grid-cols-4 border-t border-line p-3 text-sm">
                  <div className="truncate">{project.title}</div>
                  <div className="text-muted">{project.videoType}</div>
                  <div className="text-muted">{project.imageStyle}</div>
                  <Link href={`/dashboard/projects/${project.id}`} className="text-accent">Open</Link>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Usage</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Meta label="Plan" value={usage.plan} />
            <Meta label="Generations" value={generationLabel} />
            <Meta label="Projects" value={usage.projectLimit ? `${usage.savedProjects} / ${usage.projectLimit}` : `${usage.savedProjects} saved`} />
            <Meta label="Recent runs" value={String(generations.length)} />
          </div>
          <Link href="/dashboard/pricing" className="mt-5 block rounded-md border border-accent px-4 py-2 text-center text-sm font-medium text-fg hover:bg-accent">
            Upgrade
          </Link>
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
