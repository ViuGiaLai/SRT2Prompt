import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { setUserPlan } from "@/src/lib/plans";
import type { PlanName } from "@/src/lib/types";

const validPlans: PlanName[] = ["Free", "Creator", "Pro"];

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const plan = String(body.plan || "") as PlanName;

    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    await setUserPlan(user.id, plan);
    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login is required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not update plan." }, { status: 500 });
  }
}
