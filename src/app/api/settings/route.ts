import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { getUserSettings, setUserSettings } from "@/src/lib/user-settings";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json({ settings: await getUserSettings(user.id) });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const defaultVideoType = String(body.defaultVideoType || "").trim();
    const defaultImageStyle = String(body.defaultImageStyle || "").trim();
    const youtubeChannelId = String(body.youtubeChannelId || "").trim();
    const settings = await setUserSettings(user.id, { defaultVideoType, defaultImageStyle, youtubeChannelId });
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
