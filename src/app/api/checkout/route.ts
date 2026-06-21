import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { setBillingState } from "@/src/lib/billing";
import type { PlanName } from "@/src/lib/types";

const validPlans: PlanName[] = ["Creator", "Pro"];

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);
    const plan = String(url.searchParams.get("plan") || "") as PlanName;

    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const successUrl = `${getAppUrl()}/dashboard/billing/success?plan=${encodeURIComponent(plan)}`;
    const cancelUrl = `${getAppUrl()}/dashboard/pricing`;
    const checkoutUrl = buildCheckoutUrl(plan, {
      userId: user.id,
      email: user.email,
      name: user.name || "",
      successUrl,
      cancelUrl
    });

    await setBillingState(user.id, {
      plan,
      status: "pending",
      nextBillingDate: null,
      manageUrl: null
    });

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.redirect(new URL("/login", getAppUrl()));
    }
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildCheckoutUrl(plan: PlanName, input: { userId: string; email: string; name: string; successUrl: string; cancelUrl: string }) {
  const template =
    (plan === "Creator"
      ? process.env.LEMON_SQUEEZY_CHECKOUT_URL_CREATOR
      : process.env.LEMON_SQUEEZY_CHECKOUT_URL_PRO) ||
    process.env.LEMON_SQUEEZY_CHECKOUT_URL_TEMPLATE ||
    process.env.LEMON_SQUEEZY_CHECKOUT_URL ||
    "";

  if (!template) {
    throw new Error("Missing Lemon Squeezy checkout URL template.");
  }

  return template
    .replaceAll("{{plan}}", plan)
    .replaceAll("{{user_id}}", input.userId)
    .replaceAll("{{email}}", input.email)
    .replaceAll("{{name}}", input.name)
    .replaceAll("{{success_url}}", input.successUrl)
    .replaceAll("{{cancel_url}}", input.cancelUrl)
    .replaceAll("{{app_url}}", getAppUrl());
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
