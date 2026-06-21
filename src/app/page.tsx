import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Image, Tags, Youtube } from "lucide-react";

const features = [
  { title: "Scene Prompt Generator", icon: Image },
  { title: "Thumbnail Prompt Generator", icon: Youtube },
  { title: "YouTube Metadata Generator", icon: Tags },
  { title: "SRT Translator Ready", icon: FileText }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-workspace text-fg">
      <section className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-line bg-panel px-3 py-2 text-sm text-muted">
            Creator SaaS + storyboard workspace
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight lg:text-6xl">
            Turn SRT files into ready-to-use video content packs.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Generate scene prompts, thumbnail prompts, YouTube titles, descriptions, hashtags, and
            keywords from your script or subtitle file.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/generate" className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-5 font-medium text-white hover:bg-accent-strong">
              Start Free
              <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="inline-flex h-12 items-center rounded-md border border-line bg-panel px-5 font-medium text-fg hover:border-accent">
              Generate Demo
            </Link>
          </div>
        </div>

        <div id="demo" className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
            <div>
              <div className="text-sm text-muted">Input</div>
              <div className="font-medium">hospital-night-shift.srt</div>
            </div>
            <div className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-fg">Generated</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["12 scene prompts", "5 title ideas", "1 thumbnail prompt", "Description", "Hashtags", "Keywords"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-line bg-panelSoft p-3 text-sm">
                <CheckCircle2 className="text-success" size={17} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-accent/30 bg-panelSoft p-4">
            <div className="mb-2 text-xs text-muted">Scene 1-3</div>
            <p className="text-sm leading-6">
              A dark cinematic illustration of a tired night security guard standing outside a quiet
              hospital at dusk, soft shadows, empty street, tense atmosphere, no gore.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Paste your SRT or script", "Choose video type and image style", "Generate your content pack"].map((item, index) => (
              <div key={item} className="rounded-lg border border-line bg-panel p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-semibold">{index + 1}</div>
                <div className="font-medium">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">Built for faceless video creators</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border border-line bg-panel p-5">
                  <Icon className="mb-4 text-accent" size={24} />
                  <div className="font-medium">{feature.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">Output preview</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[
              ["Scene 1-3", "A dark cinematic illustration of a tired night security guard outside a quiet hospital."],
              ["Scene 4-7", "A quiet hospital hallway with flickering lights, deep shadows, and a tense composition."],
              ["Thumbnail Prompt", "A security guard standing in front of a dark hospital door with clean text space."]
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-line bg-panel p-5">
                <div className="mb-2 text-sm text-muted">{title}</div>
                <p className="text-sm leading-6 text-fg">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">Pricing</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Free", "$0", "3 generations/day", "Basic features"],
              ["Creator", "$5/month", "100 generations/month", "Best for creators"],
              ["Pro", "$9/month", "Unlimited", "Advanced features"]
            ].map(([name, price, limit, detail]) => (
              <div key={name} className="rounded-lg border border-line bg-panel p-5">
                <div className="text-xl font-semibold">{name}</div>
                <div className="mt-4 text-3xl font-semibold">{price}</div>
                <div className="mt-4 text-sm text-muted">{limit}</div>
                <div className="mt-2 text-sm text-muted">{detail}</div>
                <Link href="/register" className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
                  Start Free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-muted md:flex-row">
          <div>SRT2Prompt</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/">Product</Link>
            <Link href="/dashboard/pricing">Pricing</Link>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
