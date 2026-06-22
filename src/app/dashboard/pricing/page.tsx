import { PricingCard } from "@/components/dashboard/PricingCard";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan } from "@/src/lib/plans";

export default async function PricingPage() {
  const user = await requireUser();
  const currentPlan = await getUserPlan(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-sm text-muted">Compare what each plan includes before going to Lemon Squeezy checkout.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PricingCard plan="Free" price="$0" active={currentPlan === "Free"} currentPlan={currentPlan} />
        <PricingCard plan="Creator" price="$5/month" active={currentPlan === "Creator"} currentPlan={currentPlan} recommended />
        <PricingCard plan="Pro" price="$9/month" active={currentPlan === "Pro"} currentPlan={currentPlan} />
      </div>
    </div>
  );
}
