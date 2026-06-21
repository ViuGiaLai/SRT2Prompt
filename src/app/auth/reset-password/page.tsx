"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("srt2prompt_oauth_hash");
    const hash = saved || window.location.hash;
    sessionStorage.removeItem("srt2prompt_oauth_hash");

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const token = params.get("access_token") || "";
    const type = params.get("type") || "";

    if (type !== "recovery" || !token) {
      setError("Invalid or expired reset link.");
      return;
    }

    setAccessToken(token);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not reset password.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-workspace px-5 text-fg">
      <div className="w-full max-w-md rounded-lg border border-line bg-panel p-6">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-success" size={40} />
            <h1 className="mt-4 text-2xl font-semibold">Password updated</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your password has been reset successfully.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500"
            >
              Back to login
            </Link>
          </div>
        ) : error && !accessToken ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Invalid link</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{error}</p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500"
            >
              Request new link
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Set new password</h1>
            <p className="mt-2 text-sm text-muted">Enter your new password below.</p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-fg">New password</span>
                <input
                  className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </label>

              {error && (
                <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !accessToken}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : null}
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
