import Link from "next/link";
import { CreditCard, FileText, LayoutDashboard, Settings, Sparkles } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/generate", label: "Generate", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-line bg-panel/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] text-muted hover:text-fg">
            <Icon size={17} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
