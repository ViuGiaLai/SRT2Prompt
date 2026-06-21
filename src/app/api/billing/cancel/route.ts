import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { cancelBilling } from "@/src/lib/billing";

export async function POST() {
  try {
    const user = await requireApiUser();
    await cancelBilling(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not cancel plan." }, { status: 500 });
  }
}
