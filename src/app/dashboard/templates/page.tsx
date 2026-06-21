import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan } from "@/src/lib/plans";

const templates = [
  {
    title: "Horror Story Pack",
    description: "Dark cinematic scenes, tense thumbnail prompt, curiosity-driven titles.",
    config: "Horror Story / Dark Cinematic / English / Medium scenes"
  },
  {
    title: "Reddit Story Pack",
    description: "Clean story beats for narration channels and faceless videos.",
    config: "Reddit Story / Semi Realistic / English / Auto scenes"
  },
  {
    title: "YouTube Shorts Pack",
    description: "Short scene ranges, direct hooks, compact metadata.",
    config: "Shorts / 2D Minimal / English / Short scenes"
  },
  {
    title: "Educational Video Pack",
    description: "Clear visual explanation prompts and searchable metadata.",
    config: "Educational / 2D Minimal / English / Medium scenes"
  },
  {
    title: "Bedtime Story Pack",
    description: "Soft, calm story beats for long-form narration and gentle visuals.",
    config: "Bedtime Story / Children Book / English / Medium scenes"
  },
  {
    title: "Product Review Pack",
    description: "Product-focused scene prompts with practical thumbnail direction.",
    config: "Product Review / Semi Realistic / English / Auto scenes"
  }
];

export default async function TemplatesPage() {
  const user = await requireUser();
  const plan = await getUserPlan(user.id);
  const locked = plan === "Free";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Templates</h1>
        <p className="mt-2 text-sm text-muted">
          {locked ? "Templates are available on Creator and Pro plans." : "Start from a focused workflow, then generate your content pack."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Panel key={template.title} className="flex flex-col">
            <h2 className="text-lg font-semibold">{template.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted">{template.description}</p>
            <div className="mt-4 rounded-md border border-line bg-panelSoft p-3 text-xs text-gray-200">
              {template.config}
            </div>
            <div className="mt-4 flex gap-2">
              {locked ? (
                <Link href="/dashboard/pricing" className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-violet-500">
                  Upgrade
                </Link>
              ) : (
                <>
                  <Link href="/dashboard/generate" className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-violet-500">
                    Use Template
                  </Link>
                  <Link href="/dashboard/generate" className="rounded-md border border-line px-3 py-2 text-sm text-white hover:border-accent">
                    Preview Output
                  </Link>
                </>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
