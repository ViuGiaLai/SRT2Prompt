import { LogOut, Search, Sparkles, UserCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import type { AuthUser } from "@/src/lib/auth";

export function Topbar({ user }: { user: AuthUser }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-line bg-workspace/95 px-4 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-line bg-panel px-3 py-2 text-sm text-muted">
        <Search size={16} />
        <span className="truncate">Search projects...</span>
      </div>
      <a
        href="/dashboard/generate"
        className="hidden h-10 items-center gap-2 rounded-md border border-accent bg-accent px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-accent-strong hover:shadow-md active:scale-[0.99] sm:inline-flex"
      >
        <Sparkles size={16} />
        New Project
      </a>
      <ThemeToggle />
      <div className="hidden min-w-0 items-center gap-2 text-sm text-muted md:flex">
        <UserCircle size={24} />
        <span className="max-w-40 truncate">{user.email}</span>
      </div>
      <a href="/api/auth/logout" className="rounded-md border border-line p-2 text-muted transition-colors duration-200 ease-out hover:border-accent hover:text-fg" title="Sign out">
        <LogOut size={16} />
      </a>
    </header>
  );
}
