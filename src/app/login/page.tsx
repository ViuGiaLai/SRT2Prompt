"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not login.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-workspace text-white">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-6">
          <Link href="/" className="text-sm text-muted hover:text-white">SRT2Prompt</Link>
          <h1 className="mt-6 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Continue creating your video content packs.</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Email</span>
              <input className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Password</span>
              <input className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
            <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60">
              {loading ? "Logging in..." : "Login"}
              <ArrowRight size={16} />
            </button>
            <Link href="/api/auth/google" className="flex h-11 w-full items-center justify-center rounded-md border border-line bg-panelSoft text-sm text-white hover:border-accent">
              Continue with Google
            </Link>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/register" className="text-muted hover:text-white">Create account</Link>
            <span className="text-muted">Forgot password</span>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
            <FileText className="text-accent" size={24} />
            <div>
              <div className="text-sm text-muted">Workspace preview</div>
              <div className="font-medium">Generate content packs from SRT files</div>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-200">
            <div className="rounded-md border border-line bg-panelSoft p-3">Scene prompt cards</div>
            <div className="rounded-md border border-line bg-panelSoft p-3">Thumbnail prompt and title options</div>
            <div className="rounded-md border border-line bg-panelSoft p-3">Export TXT, MD, and JSON</div>
          </div>
        </div>
      </section>
    </main>
  );
}
