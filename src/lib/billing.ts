import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { PlanName } from "./types";
import { getUserPlan, setUserPlan } from "./plans";

export type BillingStatus = "active" | "trialing" | "past_due" | "canceled" | "pending";

export type BillingState = {
  userId: string;
  plan: PlanName;
  status: BillingStatus;
  priceLabel: string;
  nextBillingDate: string | null;
  provider: "lemon-squeezy";
  manageUrl?: string | null;
  updatedAt: string;
};

const localBillingPath = path.join(process.cwd(), "data", "billing.json");

const planPrices: Record<PlanName, string> = {
  Free: "$0",
  Creator: "$5/month",
  Pro: "$9/month"
};

export async function getBillingState(userId: string): Promise<BillingState> {
  const state = await readLocalBilling();
  const currentPlan = await getUserPlan(userId);
  const found = state[userId];

  if (found) {
    return {
      ...found,
      plan: found.plan || currentPlan,
      priceLabel: planPrices[found.plan || currentPlan],
      provider: "lemon-squeezy"
    };
  }

  return {
    userId,
    plan: currentPlan,
    status: currentPlan === "Free" ? "pending" : "active",
    priceLabel: planPrices[currentPlan],
    nextBillingDate: currentPlan === "Free" ? null : getDefaultRenewalDate(),
    provider: "lemon-squeezy",
    manageUrl: null,
    updatedAt: new Date().toISOString()
  };
}

export async function setBillingState(userId: string, input: Partial<BillingState> & { plan?: PlanName }) {
  const state = await readLocalBilling();
  const current = state[userId];
  const next: BillingState = {
    userId,
    plan: input.plan || current?.plan || "Free",
    status: input.status || current?.status || "pending",
    priceLabel: planPrices[input.plan || current?.plan || "Free"],
    nextBillingDate: input.nextBillingDate ?? current?.nextBillingDate ?? null,
    provider: "lemon-squeezy",
    manageUrl: input.manageUrl ?? current?.manageUrl ?? null,
    updatedAt: new Date().toISOString()
  };

  state[userId] = next;
  await writeLocalBilling(state);
  if (input.plan) {
    await setUserPlan(userId, input.plan);
  }
  return next;
}

export async function cancelBilling(userId: string) {
  return setBillingState(userId, {
    status: "canceled",
    nextBillingDate: null
  });
}

export function priceForPlan(plan: PlanName) {
  return planPrices[plan];
}

function getDefaultRenewalDate() {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return next.toISOString();
}

async function readLocalBilling(): Promise<Record<string, BillingState>> {
  try {
    const content = await readFile(localBillingPath, "utf8");
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalBilling(state: Record<string, BillingState>) {
  await mkdir(path.dirname(localBillingPath), { recursive: true });
  await writeFile(localBillingPath, JSON.stringify(state, null, 2), "utf8");
}
