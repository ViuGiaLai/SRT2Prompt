import Link from "next/link";
import type { PlanName } from "@/src/lib/types";

export function UpgradeButton({ plan, active }: { plan: PlanName; active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex w-full items-center justify-center rounded-md border border-success bg-success px-4 py-2 text-sm font-medium text-fg transition-colors duration-200 ease-out">
        Current
      </span>
    );
  }

  return (
    <Link
      href={`/api/checkout?plan=${encodeURIComponent(plan)}`}
      className="inline-flex w-full items-center justify-center rounded-md border border-accent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-accent-strong hover:shadow-md active:scale-[0.99]"
    >
      Upgrade
    </Link>
  );
}
