import { CurrentPlanBadge } from "./CurrentPlanBadge";
import { UpgradeButton } from "./UpgradeButton";
import { Panel } from "@/components/ui/Panel";
import type { PlanName } from "@/src/lib/types";

type PricingCardProps = {
  plan: PlanName;
  price: string;
  active: boolean;
  recommended?: boolean;
};

export function PricingCard({ plan, price, active, recommended = false }: PricingCardProps) {
  return (
    <Panel className={`flex flex-col ${recommended ? "border-accent" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{plan}</h2>
          {plan === "Creator" && <p className="mt-1 text-sm text-muted">Best for faceless creators</p>}
          {plan === "Pro" && <p className="mt-1 text-sm text-muted">Best for power users</p>}
        </div>
        <CurrentPlanBadge active={active} />
      </div>
      <div className="mt-5 text-3xl font-semibold">{price}</div>
      <div className="mt-5 flex-1 rounded-lg border border-line bg-panelSoft p-4 text-sm text-muted">
        {plan === "Free" && "Start generating and test the workflow."}
        {plan === "Creator" && "Unlock the core production workflow."}
        {plan === "Pro" && "Unlock the full production toolkit."}
      </div>
      <div className="mt-5">
        <UpgradeButton plan={plan} active={active} />
      </div>
    </Panel>
  );
}
