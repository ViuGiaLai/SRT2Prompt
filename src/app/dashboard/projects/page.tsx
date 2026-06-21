import Link from "next/link";
import { FileText } from "lucide-react";
import { ProjectsBrowser } from "@/components/dashboard/ProjectsBrowser";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id).catch(() => null);
  const latestProject = projects?.[0] || null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-2 text-sm text-muted">Saved SRT2Prompt content packs. Start a new one from the generator.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {latestProject && (
            <Link href={`/dashboard/projects/${latestProject.id}`} className="rounded-md border border-line px-4 py-2 text-sm text-fg hover:border-accent">
              Open Latest
            </Link>
          )}
          <Link href="/dashboard/generate" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
            New Project
          </Link>
        </div>
      </div>

      {projects === null ? (
        <Panel className="py-16 text-center">
          <FileText className="mx-auto mb-4 text-warning" size={36} />
          <h2 className="text-xl font-semibold">Project store is not available.</h2>
          <p className="mt-2 text-sm text-muted">
            Check DATABASE_URL if you are using Postgres, or restart the dev server to use the local project store.
          </p>
        </Panel>
      ) : projects.length === 0 ? (
        <Panel className="py-16 text-center">
          <FileText className="mx-auto mb-4 text-accent" size={36} />
          <h2 className="text-xl font-semibold">No projects yet.</h2>
          <p className="mt-2 text-sm text-muted">Generate and save your first content pack.</p>
        </Panel>
      ) : (
        <ProjectsBrowser projects={projects} />
      )}
    </div>
  );
}
