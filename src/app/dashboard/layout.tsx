import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Topbar } from "@/components/dashboard/Topbar";
import { requireUser } from "@/src/lib/auth";
import { listProjects } from "@/src/lib/projects";
import { getUsage } from "@/src/lib/plans";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const projects = await listProjects(user.id).catch(() => []);
  const usage = await getUsage(user.id, projects.length);

  return (
    <div className="min-h-screen bg-workspace text-fg">
      <div className="flex">
        <AppSidebar usage={usage} />
        <div className="min-w-0 flex-1">
          <Topbar user={user} />
          <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 lg:px-6 lg:pb-6">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
