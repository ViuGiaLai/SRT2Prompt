"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanName } from "@/src/lib/types";

const PLAN_ORDER: PlanName[] = ["Free", "Creator", "Pro"];

export function PlanButton({ plan, currentPlan }: { plan: PlanName; currentPlan: PlanName }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const active = plan === currentPlan;
  const isDowngrade = PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(currentPlan);

  async function updatePlan() {
    if (active || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (!response.ok) throw new Error("Could not update plan.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void updatePlan()}
      disabled={active || loading}
      className={`mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? "border border-success bg-success text-fg"
          : "border border-accent bg-accent text-white hover:bg-violet-500"
      }`}
    >
      {active ? "Current Plan" : loading ? "Updating..." : isDowngrade ? "Downgrade" : "Upgrade"}
    </button>
  );
}
