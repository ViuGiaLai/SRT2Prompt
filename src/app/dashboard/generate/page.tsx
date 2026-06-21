import { GeneratorWorkspace } from "@/components/generator/GeneratorWorkspace";
import { requireUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";
import { getUsage } from "@/src/lib/plans";

export default async function GeneratePage() {
  const user = await requireUser();
  const projects = await listProjects(user.id).catch(() => []);
  const usage = await getUsage(user.id, projects.length);

  return <GeneratorWorkspace usage={usage} />;
}
