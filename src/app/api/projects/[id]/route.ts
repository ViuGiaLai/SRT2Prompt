import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { deleteProject, duplicateProject, getProject, updateProjectContent } from "@/src/lib/projects";
import type { ContentPack } from "@/src/lib/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const project = await getProject(params.id, user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not load project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const body = await request.json().catch(() => ({}));

    if (body.action !== "duplicate") {
      return NextResponse.json({ error: "Unsupported project action." }, { status: 400 });
    }

    const project = await duplicateProject(params.id, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not update project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const deleted = await deleteProject(params.id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not delete project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const contentPack = body.contentPack as ContentPack | undefined;
    const videoType = typeof body.videoType === "string" ? body.videoType : undefined;
    const imageStyle = typeof body.imageStyle === "string" ? body.imageStyle : undefined;
    const language = typeof body.language === "string" ? body.language : undefined;

    if (!contentPack?.scenePrompts || !contentPack.summary) {
      return NextResponse.json({ error: "Valid contentPack is required." }, { status: 400 });
    }

    const project = await updateProjectContent(params.id, user.id, contentPack, { videoType, imageStyle, language });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not save project changes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
