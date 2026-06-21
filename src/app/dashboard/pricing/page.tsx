import { CheckCircle2, XCircle } from "lucide-react";
import { PlanButton } from "@/components/dashboard/PlanButton";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan } from "@/src/lib/plans";
import type { PlanName } from "@/src/lib/types";

const plans: Array<{
  name: PlanName;
  price: string;
  suitable: string;
  included: string[];
  excluded: string[];
}> = [
  {
    name: "Free",
    price: "$0",
    suitable: "New users trying SRT2Prompt",
    included: [
      "3 generations/day",
      "20 subtitle lines per generation",
      "3 saved projects",
      "Summary, scene prompts, 3 titles, description, hashtags",
      "Dark Cinematic and 2D Minimal styles",
      "English and Vietnamese"
    ],
    excluded: ["Export files", "Thumbnail prompt", "Keywords", "Project history", "Custom templates"]
  },
  {
    name: "Creator",
    price: "$5/month",
    suitable: "Faceless YouTubers and TikTok creators",
    included: [
      "100 generations/month",
      "1000 subtitle lines per generation",
      "Unlimited projects",
      "Thumbnail prompt, 10 titles, keywords",
      "TXT and Markdown export",
      "Project history and regenerate tools"
    ],
    excluded: ["Batch generation", "JSON/CSV export", "Team workspace", "API access"]
  },
  {
    name: "Pro",
    price: "$9/month",
    suitable: "Power users, agencies, heavy creators",
    included: [
      "Unlimited generations",
      "Unlimited subtitle lines",
      "Unlimited projects",
      "TXT, Markdown, JSON, and CSV export",
      "Advanced templates and controls",
      "Priority generation"
    ],
    excluded: []
  }
];

export default async function PricingPage() {
  const user = await requireUser();
  const currentPlan = await getUserPlan(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-sm text-muted">Free to start, Creator for most channels, Pro for heavy production.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Panel key={plan.name} className={plan.name === "Creator" ? "border-accent" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.suitable}</p>
              </div>
              {plan.name === "Creator" && (
                <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-white">Recommended</span>
              )}
            </div>

            <div className="mt-5 text-3xl font-semibold">{plan.price}</div>

            <ul className="mt-5 space-y-3 text-sm">
              {plan.included.map((item) => (
                <li key={item} className="flex gap-2 text-gray-100">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={16} />
                  {item}
                </li>
              ))}
              {plan.excluded.map((item) => (
                <li key={item} className="flex gap-2 text-muted">
                  <XCircle className="mt-0.5 shrink-0 text-danger" size={16} />
                  {item}
                </li>
              ))}
            </ul>

            <PlanButton plan={plan.name} currentPlan={currentPlan} />
          </Panel>
        ))}
      </div>
    </div>
  );
}
