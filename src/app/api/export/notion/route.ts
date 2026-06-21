import { NextResponse } from "next/server";
import { exportPackToNotion } from "@/src/lib/integrations";
import { requireApiUser } from "@/src/lib/auth";
import type { ContentPack } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = (await request.json()) as { pack?: ContentPack };
    if (!body.pack) {
      return NextResponse.json({ error: "Content pack is required." }, { status: 400 });
    }

    const result = await exportPackToNotion(body.pack);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not export to Notion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
