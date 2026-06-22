import Link from "next/link";
import type { PlanName } from "@/src/lib/types";

const PLAN_ORDER: PlanName[] = ["Free", "Creator", "Pro"];

export function UpgradeButton({ plan, active, currentPlan }: { plan: PlanName; active: boolean; currentPlan: PlanName }) {
  if (active) {
    return (
      <span className="inline-flex w-full items-center justify-center rounded-md border border-success bg-success px-4 py-2 text-sm font-medium text-fg transition-colors duration-200 ease-out">
        Current Plan
      </span>
    );
  }

  const isDowngrade = PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(currentPlan);

  return (
    <Link
      href={`/api/checkout?plan=${encodeURIComponent(plan)}`}
      className="inline-flex w-full items-center justify-center rounded-md border border-accent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-accent-strong hover:shadow-md active:scale-[0.99]"
    >
      {isDowngrade ? "Downgrade" : "Upgrade"}
    </Link>
  );
}
