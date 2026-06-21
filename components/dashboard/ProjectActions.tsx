"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyPlus, Trash2 } from "lucide-react";

export function ProjectActions({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function duplicateProject() {
    setLoading("duplicate");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not duplicate project.");
      router.push(`/dashboard/projects/${data.project.id}`);
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  async function deleteProject() {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    setLoading("delete");
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete project.");
      }
      router.push("/dashboard/projects");
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/dashboard/projects" className="rounded-md border border-line px-4 py-2 text-sm text-white hover:border-accent">
        Back
      </Link>
      <button
        type="button"
        onClick={() => void duplicateProject()}
        disabled={loading === "duplicate"}
        className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm text-white hover:border-accent disabled:opacity-60"
      >
        <CopyPlus size={15} />
        {loading === "duplicate" ? "Duplicating..." : "Duplicate"}
      </button>
      <button
        type="button"
        onClick={() => void deleteProject()}
        disabled={loading === "delete"}
        className="inline-flex items-center gap-2 rounded-md border border-danger px-4 py-2 text-sm text-red-100 hover:bg-red-500/10 disabled:opacity-60"
      >
        <Trash2 size={15} />
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
