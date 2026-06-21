import { NextResponse } from "next/server";
import { setBillingState } from "@/src/lib/billing";
import type { PlanName } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (secret) {
      const incoming = request.headers.get("x-webhook-secret") || request.headers.get("x-lemon-squeezy-secret");
      if (incoming !== secret) {
        return NextResponse.json({ error: "Invalid webhook secret." }, { status: 401 });
      }
    }

    const payload = await request.json();
    const userId =
      payload?.meta?.custom_data?.user_id ||
      payload?.meta?.custom_data?.userId ||
      payload?.data?.attributes?.custom_data?.user_id ||
      payload?.data?.attributes?.custom_data?.userId;

    const plan = inferPlan(payload);
    const status = inferStatus(payload);
    const nextBillingDate = payload?.data?.attributes?.renews_at || payload?.data?.attributes?.ends_at || null;
    const manageUrl = payload?.data?.attributes?.urls?.update_payment_method || payload?.data?.attributes?.urls?.customer_portal || null;

    if (userId && plan) {
      await setBillingState(String(userId), {
        plan,
        status,
        nextBillingDate,
        manageUrl
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function inferPlan(payload: any): PlanName {
  const raw =
    payload?.meta?.custom_data?.plan ||
    payload?.meta?.custom_data?.plan_name ||
    payload?.data?.attributes?.variant_name ||
    payload?.data?.attributes?.product_name ||
    "";

  const normalized = String(raw).toLowerCase();
  if (normalized.includes("pro")) return "Pro";
  if (normalized.includes("creator")) return "Creator";
  return "Free";
}

function inferStatus(payload: any) {
  const raw = String(payload?.meta?.event_name || payload?.meta?.event || payload?.event_name || "").toLowerCase();
  if (raw.includes("cancel")) return "canceled";
  if (raw.includes("past_due")) return "past_due";
  if (raw.includes("trial")) return "trialing";
  return "active";
}
