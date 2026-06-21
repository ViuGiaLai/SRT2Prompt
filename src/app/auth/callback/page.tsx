"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function saveSession() {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        setError(errorDescription);
        return;
      }

      if (!accessToken || !refreshToken) {
        setError("Google login did not return a valid session.");
        return;
      }

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Could not save login session.");
        return;
      }

      router.replace("/dashboard");
    }

    void saveSession();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-workspace px-5 text-white">
      <div className="w-full max-w-md rounded-lg border border-line bg-panel p-6 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold">Login failed</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{error}</p>
            <Link href="/login" className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-accent" size={28} />
            <h1 className="mt-4 text-2xl font-semibold">Signing you in</h1>
            <p className="mt-2 text-sm text-muted">Saving your SRT2Prompt session...</p>
          </>
        )}
      </div>
    </main>
  );
}
