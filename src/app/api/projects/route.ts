import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { listProjects, saveProject } from "@/src/lib/projects";
import { assertCanSaveProject, getUsage } from "@/src/lib/plans";

export async function GET() {
  try {
    const user = await requireApiUser();
    const projects = await listProjects(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not load projects.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const projects = await listProjects(user.id).catch(() => []);
    const usage = await getUsage(user.id, projects.length);
    assertCanSaveProject(usage);
    const project = await saveProject({ ...body, userId: user.id });
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not save project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
