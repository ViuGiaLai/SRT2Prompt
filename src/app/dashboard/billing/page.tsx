import Link from "next/link";
import { CurrentPlanBadge } from "@/components/dashboard/CurrentPlanBadge";
import { CancelPlanButton } from "@/components/dashboard/CancelPlanButton";
import { ManageSubscriptionButton } from "@/components/dashboard/ManageSubscriptionButton";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getBillingState, priceForPlan } from "@/src/lib/billing";

export default async function BillingPage() {
  const user = await requireUser();
  const billing = await getBillingState(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="mt-2 text-sm text-muted">Your subscription and renewal details.</p>
      </div>

      <BillingStatusCard
        plan={billing.plan}
        price={billing.priceLabel || priceForPlan(billing.plan)}
        status={billing.status}
        nextBillingDate={billing.nextBillingDate}
      />

      <div className="flex flex-wrap gap-3">
        <ManageSubscriptionButton />
        <CancelPlanButton />
        <Link href="/dashboard/pricing" className="rounded-md border border-line px-4 py-2 text-sm text-white hover:border-accent">
          Change Plan
        </Link>
      </div>
    </div>
  );
}

function BillingStatusCard({
  plan,
  price,
  status,
  nextBillingDate
}: {
  plan: string;
  price: string;
  status: string;
  nextBillingDate: string | null;
}) {
  return (
    <Panel className="max-w-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Billing Status</h2>
          <p className="mt-1 text-sm text-muted">Manage your active plan here.</p>
        </div>
        <CurrentPlanBadge active={status === "active"} />
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <Line label="Current Plan" value={plan} />
        <Line label="Price" value={price} />
        <Line label="Status" value={status} />
        <Line label="Next billing date" value={nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : "Not set"} />
      </div>
    </Panel>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}
