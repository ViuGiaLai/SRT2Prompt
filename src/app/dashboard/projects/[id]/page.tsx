import { notFound } from "next/navigation";
import { ProjectActions } from "@/components/dashboard/ProjectActions";
import { OutputTabs } from "@/components/generator/OutputTabs";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getProject } from "@/src/lib/projects";
import { getUserPlan } from "@/src/lib/plans";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [project, plan] = await Promise.all([
    getProject(params.id, user.id),
    getUserPlan(user.id)
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {project.videoType} / {project.imageStyle} / Created {new Date(project.createdAt).toLocaleString()}
          </p>
        </div>
        <ProjectActions projectId={project.id} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <OutputTabs pack={project.contentPack} plan={plan} projectId={project.id} />

        <Panel>
          <h2 className="mb-4 text-lg font-semibold">Metadata</h2>
          <div className="space-y-3 text-sm text-muted">
            <Meta label="Input type" value={project.inputType} />
            <Meta label="Video type" value={project.videoType} />
            <Meta label="Style" value={project.imageStyle} />
            <Meta label="Scenes" value={String(project.sceneCount)} />
            <Meta label="Language" value={project.language} />
            <Meta label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
            <Meta label="Updated" value={new Date(project.updatedAt).toLocaleDateString()} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span>{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}
