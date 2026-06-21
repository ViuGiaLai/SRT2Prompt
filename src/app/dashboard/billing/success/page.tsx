import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export default function BillingSuccessPage({
  searchParams
}: {
  searchParams?: { plan?: string };
}) {
  const plan = searchParams?.plan || "your plan";

  return (
    <Panel className="max-w-xl">
      <h1 className="text-3xl font-semibold">Payment received</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Your {plan} subscription is being confirmed. Billing will update automatically after the Lemon Squeezy webhook arrives.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard/billing" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong">
          Go to Billing
        </Link>
        <Link href="/dashboard/pricing" className="rounded-md border border-line px-4 py-2 text-sm text-white hover:border-accent">
          Back to Pricing
        </Link>
      </div>
    </Panel>
  );
}
