"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Project } from "@/src/lib/types";

const filters = ["All", "Horror", "Mystery", "Reddit", "Education", "Shorts"] as const;

export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery =
        !normalizedQuery ||
        project.title.toLowerCase().includes(normalizedQuery) ||
        project.videoType.toLowerCase().includes(normalizedQuery) ||
        project.imageStyle.toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "All" || project.videoType.toLowerCase().includes(filter.toLowerCase());
      return matchesQuery && matchesFilter;
    });
  }, [filter, projects, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm text-muted">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-md border px-3 py-2 text-sm ${
                filter === item ? "border-accent bg-accent text-white" : "border-line bg-panel text-muted hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-line bg-panel p-8 text-center text-sm text-muted">
          No projects match your search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="rounded-lg border border-line bg-panel p-5 transition hover:border-accent">
              <div className="mb-3 line-clamp-2 text-lg font-semibold">{project.title}</div>
              <div className="space-y-2 text-sm text-muted">
                <div>{project.videoType} / {project.imageStyle}</div>
                <div>{project.sceneCount} scenes</div>
                <div>{new Date(project.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
