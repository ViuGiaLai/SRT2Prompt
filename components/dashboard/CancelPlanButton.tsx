"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelPlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelPlan() {
    const confirmed = window.confirm("Cancel this subscription?");
    if (!confirmed) return;
    setLoading(true);
    try {
      const response = await fetch("/api/billing/cancel", { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not cancel plan.");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void cancelPlan()}
      disabled={loading}
      className="rounded-md border border-danger px-4 py-2 text-sm text-red-100 transition-all duration-200 ease-out hover:bg-red-500/10 active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? "Cancelling..." : "Cancel Plan"}
    </button>
  );
}
