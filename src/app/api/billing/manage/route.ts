import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth";
import { getBillingState } from "@/src/lib/billing";

export async function GET() {
  try {
    const user = await requireApiUser();
    const billing = await getBillingState(user.id);
    const template =
      process.env.LEMON_SQUEEZY_MANAGE_URL_TEMPLATE ||
      process.env.LEMON_SQUEEZY_MANAGE_URL ||
      billing.manageUrl ||
      "";

    if (!template) {
      return NextResponse.redirect(new URL("/dashboard/billing", getAppUrl()));
    }

    const manageUrl = template
      .replaceAll("{{user_id}}", user.id)
      .replaceAll("{{email}}", user.email)
      .replaceAll("{{app_url}}", getAppUrl());

    return NextResponse.redirect(manageUrl);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.redirect(new URL("/login", getAppUrl()));
    }
    return NextResponse.redirect(new URL("/dashboard/billing", getAppUrl()));
  }
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
