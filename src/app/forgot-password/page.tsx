"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send reset email.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-workspace px-5 text-fg">
      <div className="w-full max-w-md rounded-lg border border-line bg-panel p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <BrandIcon size={18} />
          <span>SRT2Prompt</span>
        </Link>

        {sent ? (
          <div className="mt-6 text-center">
            <Mail className="mx-auto text-accent" size={40} />
            <h1 className="mt-4 text-2xl font-semibold">Check your email</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              We sent a password reset link to <strong className="text-fg">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-semibold">Reset your password</h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-fg">Email</span>
                <input
                  className="h-11 w-full rounded-md border border-line bg-panelSoft px-3 text-sm focus-ring"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              {error && (
                <div className="rounded-md border border-danger bg-red-500/10 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm">
              <Link href="/login" className="text-muted hover:text-fg">
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
