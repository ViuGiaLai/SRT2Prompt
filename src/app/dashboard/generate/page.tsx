import { GeneratorWorkspace } from "@/components/generator/GeneratorWorkspace";
import { requireUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";
import { getUsage } from "@/src/lib/plans";
import { getUserSettings } from "@/src/lib/user-settings";

export default async function GeneratePage() {
  const user = await requireUser();
  const projects = await listProjects(user.id).catch(() => []);
  const usage = await getUsage(user.id, projects.length);
  const settings = await getUserSettings(user.id);

  return (
    <GeneratorWorkspace
      usage={usage}
      initialVideoType={settings.defaultVideoType || "Horror Story"}
      initialImageStyle={settings.defaultImageStyle || "Dark Cinematic"}
      recentVideoTypes={settings.recentVideoTypes}
      recentImageStyles={settings.recentImageStyles}
    />
  );
}
