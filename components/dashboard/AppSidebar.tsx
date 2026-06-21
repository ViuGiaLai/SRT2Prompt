import Link from "next/link";
import { BarChart3, Bug, CreditCard, FileText, History, LayoutDashboard, Settings, Sparkles, Wand2 } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";
import type { PlanUsage } from "@/src/lib/types";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/generate", label: "Generate", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/templates", label: "Templates", icon: Wand2 },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/diagnostics", label: "Diagnostics", icon: Bug },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function AppSidebar({ usage }: { usage: PlanUsage }) {
  const usageText =
    usage.dailyLimit !== null
      ? `${usage.dailyGenerations} / ${usage.dailyLimit} today`
      : usage.monthlyLimit !== null
        ? `${usage.monthlyGenerations} / ${usage.monthlyLimit} month`
        : "Unlimited";
  const percent =
    usage.dailyLimit !== null
      ? Math.min(100, Math.round((usage.dailyGenerations / usage.dailyLimit) * 100))
      : usage.monthlyLimit !== null
        ? Math.min(100, Math.round((usage.monthlyGenerations / usage.monthlyLimit) * 100))
        : 100;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-line bg-workspace p-4 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-panelSoft ring-1 ring-line">
          <BrandIcon size={28} />
        </div>
        <div>
          <div className="text-sm font-semibold text-fg">SRT2Prompt</div>
          <div className="text-xs text-muted">Storyboard workspace</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-panelSoft hover:text-fg"
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-line bg-panel p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fg">
          <BarChart3 size={16} />
          Usage
        </div>
        <div className="text-xs text-muted">{usage.plan}: {usageText}</div>
        <div className="mt-3 h-2 rounded-full bg-panelSoft">
          <div className="h-2 rounded-full bg-success" style={{ width: `${percent}%` }} />
        </div>
        <Link
          href="/dashboard/pricing"
          className="mt-4 block rounded-md border border-accent px-3 py-2 text-center text-xs font-medium text-fg hover:bg-accent"
        >
          Upgrade
        </Link>
      </div>
    </aside>
  );
}
