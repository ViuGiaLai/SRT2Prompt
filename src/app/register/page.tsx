"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create account.");
      router.push("/dashboard/generate");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-workspace text-fg">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-6">
          <Link href="/" className="text-sm text-muted hover:text-fg">SRT2Prompt</Link>
          <h1 className="mt-6 text-3xl font-semibold">Create your workspace</h1>
          <p className="mt-2 text-sm text-muted">Generate your first content pack in minutes.</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-fg">Name</span>
              <input className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring" type="text" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-fg">Email</span>
              <input className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-fg">Password</span>
              <input className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
            </label>
            {error && <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">{error}</div>}
            <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight size={16} />
            </button>
            <Link href="/api/auth/google" className="flex h-11 w-full items-center justify-center rounded-md border border-line bg-panelSoft text-sm text-fg hover:border-accent">
              Continue with Google
            </Link>
          </form>

          <div className="mt-5 text-sm">
            <Link href="/login" className="text-muted hover:text-fg">Already have an account?</Link>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
            <Sparkles className="text-accent" size={24} />
            <div>
              <div className="text-sm text-muted">First content pack</div>
              <div className="font-medium">Paste SRT, choose style, generate output</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Summary", "Scene prompts", "Thumbnail", "Titles", "Description", "Hashtags"].map((item) => (
              <div key={item} className="rounded-md border border-line bg-panelSoft p-3 text-sm text-fg">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
