import { Check } from "lucide-react";
import { CurrentPlanBadge } from "./CurrentPlanBadge";
import { UpgradeButton } from "./UpgradeButton";
import { Panel } from "@/components/ui/Panel";
import type { PlanName } from "@/src/lib/types";

type PricingCardProps = {
  plan: PlanName;
  price: string;
  active: boolean;
  currentPlan: PlanName;
  recommended?: boolean;
};

export function PricingCard({ plan, price, active, currentPlan, recommended = false }: PricingCardProps) {
  return (
    <Panel className={`flex flex-col transition-transform duration-200 ease-out hover:-translate-y-0.5 ${active ? "border-accent" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{plan}</h2>
          {plan === "Creator" && <p className="mt-1 text-sm text-muted">Best for faceless creators</p>}
          {plan === "Pro" && <p className="mt-1 text-sm text-muted">Best for power users</p>}
        </div>
        <CurrentPlanBadge active={active} />
      </div>
      <div className="mt-5 text-3xl font-semibold">{price}</div>
      <div className="mt-5 flex-1 rounded-lg border border-line bg-panelSoft p-4 text-sm text-muted transition-colors duration-200 ease-out">
        <div className="text-sm font-medium text-fg">{planSubtitle(plan)}</div>
        <ul className="mt-3 space-y-2">
          {planFeatures(plan).map((feature) => (
            <li key={feature} className="flex items-start gap-2 leading-6">
              <Check size={16} className="mt-0.5 shrink-0 text-success" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <UpgradeButton plan={plan} active={active} currentPlan={currentPlan} />
      </div>
    </Panel>
  );
}

function planSubtitle(plan: PlanName) {
  if (plan === "Free") return "Test the workflow";
  if (plan === "Creator") return "Core production workflow";
  return "Full production toolkit";
}

function planFeatures(plan: PlanName) {
  if (plan === "Free") {
    return [
      "3 generations per day",
      "Up to 20 subtitle lines",
      "Up to 3 saved projects",
      "2 basic image styles",
      "3 titles per pack"
    ];
  }

  if (plan === "Creator") {
    return [
      "Up to 100 generations per month",
      "Up to 1,000 subtitle lines",
      "Unlimited saved projects",
      "Thumbnail prompts enabled",
      "TXT and Markdown export"
    ];
  }

  return [
    "Unlimited generations",
    "Unlimited subtitle lines",
    "Unlimited saved projects",
    "Thumbnail, keywords, and full export pack",
    "TXT, Markdown, JSON, and CSV export"
  ];
}
