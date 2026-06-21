import Link from "next/link";

export function ManageSubscriptionButton() {
  return (
    <Link href="/api/billing/manage" className="rounded-md border border-line px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:border-accent hover:bg-panelSoft active:scale-[0.99]">
      Manage Subscription
    </Link>
  );
}
