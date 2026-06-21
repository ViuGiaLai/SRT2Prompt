"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";

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
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
            <BrandIcon size={18} />
            <span>SRT2Prompt</span>
          </Link>
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
            <Link href="/api/auth/google" className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-panelSoft text-sm text-fg hover:border-accent">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
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
