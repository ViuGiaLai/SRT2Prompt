import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import { PLAN_LIMITS } from "./plan-config";
import type { GenerationRecord, PlanName, PlanUsage } from "./types";

const connectionString = process.env.DATABASE_URL;
const sql =
  connectionString &&
  !connectionString.includes("[YOUR-PASSWORD]") &&
  !connectionString.includes("YOUR_SUPABASE_DATABASE_PASSWORD")
    ? postgres(connectionString, {
        max: 3,
        ssl: connectionString.includes("supabase.co") ? "require" : undefined
      })
    : null;

const localGenerationsPath = path.join(process.cwd(), "data", "generations.json");
const localPlansPath = path.join(process.cwd(), "data", "plans.json");

let schemaReady = false;
let databaseAvailable = Boolean(sql);

type GenerationRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  summary: string;
  video_type: string;
  image_style: string;
  language: string;
  scene_count: number;
  subtitle_lines: number;
  status: GenerationRecord["status"];
  error: string | null;
  created_at: Date | string;
};

export async function getUserPlan(userId: string): Promise<PlanName> {
  return runWithFallback(async () => {
    await ensurePlanSchema();
    const rows = await db()`select plan_name from plans where user_id = ${userId} limit 1`;
    if (rows[0]?.plan_name) return rows[0].plan_name as PlanName;

    await db()`
      insert into plans (id, user_id, plan_name, generation_limit, created_at)
      values (${crypto.randomUUID()}, ${userId}, 'Free', 3, ${new Date().toISOString()})
    `;
    return "Free";
  }, () => getLocalPlan(userId));
}

export async function setUserPlan(userId: string, plan: PlanName) {
  return runWithFallback(async () => {
    await ensurePlanSchema();
    await db()`
      insert into plans (id, user_id, plan_name, generation_limit, created_at)
      values (${crypto.randomUUID()}, ${userId}, ${plan}, ${PLAN_LIMITS[plan].dailyLimit ?? PLAN_LIMITS[plan].monthlyLimit ?? 0}, ${new Date().toISOString()})
      on conflict (user_id) do update set plan_name = excluded.plan_name, generation_limit = excluded.generation_limit
    `;
    return plan;
  }, async () => {
    const plans = await readLocalPlans();
    plans[userId] = plan;
    await writeLocalPlans(plans);
    return plan;
  });
}

export async function listGenerations(userId: string, limit = 50): Promise<GenerationRecord[]> {
  return runWithFallback(async () => {
    await ensurePlanSchema();
    const rows = await db()`
      select id, user_id, project_id, summary, video_type, image_style, language, scene_count, subtitle_lines, status, error, created_at
      from generations
      where user_id = ${userId}
      order by created_at desc
      limit ${limit}
    `;
    return (rows as unknown as GenerationRow[]).map(rowToGeneration);
  }, async () => {
    const rows = await readLocalGenerations();
    return rows
      .filter((item) => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  });
}

export async function recordGeneration(input: Omit<GenerationRecord, "id" | "createdAt">) {
  const record: GenerationRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  return runWithFallback(async () => {
    await ensurePlanSchema();
    await db()`
      insert into generations (
        id,
        user_id,
        project_id,
        summary,
        video_type,
        image_style,
        language,
        scene_count,
        subtitle_lines,
        status,
        error,
        created_at
      )
      values (
        ${record.id},
        ${record.userId},
        ${record.projectId || null},
        ${record.summary},
        ${record.videoType},
        ${record.imageStyle},
        ${record.language},
        ${record.sceneCount},
        ${record.subtitleLines},
        ${record.status},
        ${record.error || null},
        ${record.createdAt}
      )
    `;
    return record;
  }, async () => {
    const rows = await readLocalGenerations();
    rows.unshift(record);
    await writeLocalGenerations(rows);
    return record;
  });
}

export async function getUsage(userId: string, savedProjects = 0): Promise<PlanUsage> {
  const plan = await getUserPlan(userId);
  const generations = await listGenerations(userId, 5000);
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const monthKey = now.toISOString().slice(0, 7);
  const completed = generations.filter((item) => item.status === "Completed");

  return {
    plan,
    dailyGenerations: completed.filter((item) => item.createdAt.slice(0, 10) === dayKey).length,
    monthlyGenerations: completed.filter((item) => item.createdAt.slice(0, 7) === monthKey).length,
    savedProjects,
    dailyLimit: PLAN_LIMITS[plan].dailyLimit,
    monthlyLimit: PLAN_LIMITS[plan].monthlyLimit,
    subtitleLineLimit: PLAN_LIMITS[plan].subtitleLineLimit,
    projectLimit: PLAN_LIMITS[plan].projectLimit
  };
}

export function assertCanGenerate(usage: PlanUsage, input: { subtitleLines: number; imageStyle: string; language: string }) {
  const limits = PLAN_LIMITS[usage.plan];

  if (usage.dailyLimit !== null && usage.dailyGenerations >= usage.dailyLimit) {
    throw new Error(`Free limit reached: ${usage.dailyLimit} generations/day. Upgrade to continue.`);
  }
  if (usage.monthlyLimit !== null && usage.monthlyGenerations >= usage.monthlyLimit) {
    throw new Error(`Creator limit reached: ${usage.monthlyLimit} generations/month. Upgrade to Pro to continue.`);
  }
  if (usage.subtitleLineLimit !== null && input.subtitleLines > usage.subtitleLineLimit) {
    throw new Error(`${usage.plan} plan supports up to ${usage.subtitleLineLimit} subtitle lines per generation.`);
  }
  if (!limits.allowedStyles.includes(input.imageStyle)) {
    throw new Error(`${input.imageStyle} is not available on the ${usage.plan} plan.`);
  }
  if (!limits.allowedLanguages.includes(input.language)) {
    throw new Error(`${input.language} output is not available on the ${usage.plan} plan.`);
  }
}

export function assertCanSaveProject(usage: PlanUsage) {
  if (usage.projectLimit !== null && usage.savedProjects >= usage.projectLimit) {
    throw new Error(`${usage.plan} plan supports up to ${usage.projectLimit} saved projects.`);
  }
}

export function normalizePackForPlan<T extends { titles: string[]; titlePack?: { curiosity: string[]; fear: string[]; question: string[]; clickbait: string[] }; thumbnail: { prompt: string; textOverlay: string; compositionNotes: string }; keywords: string[] }>(
  pack: T,
  plan: PlanName
) {
  const limits = PLAN_LIMITS[plan];
  const titleLimit = limits.titleLimit ?? pack.titles.length;
  const splitLimit = titleLimit >= 0 ? titleLimit : 0;
  const base = Math.floor(splitLimit / 4);
  const remainder = splitLimit % 4;
  const limitsByGroup = [base + (remainder > 0 ? 1 : 0), base + (remainder > 1 ? 1 : 0), base + (remainder > 2 ? 1 : 0), base];
  const slicePack = (items: string[], maxCount: number) => items.slice(0, Math.min(items.length, maxCount));
  const titlePack = pack.titlePack
    ? {
        curiosity: slicePack(pack.titlePack.curiosity, limitsByGroup[0]),
        fear: slicePack(pack.titlePack.fear, limitsByGroup[1]),
        question: slicePack(pack.titlePack.question, limitsByGroup[2]),
        clickbait: slicePack(pack.titlePack.clickbait, limitsByGroup[3])
      }
    : undefined;
  return {
    ...pack,
    thumbnail: limits.thumbnail ? pack.thumbnail : { prompt: "", textOverlay: "", compositionNotes: "" },
    titles: limits.titleLimit ? pack.titles.slice(0, limits.titleLimit) : pack.titles,
    titlePack,
    keywords: limits.keywords ? pack.keywords : []
  };
}

export function outputOptionsForPlan(plan: PlanName) {
  const limits = PLAN_LIMITS[plan];
  return {
    includeThumbnail: limits.thumbnail,
    includeTitles: true,
    includeDescription: true,
    includeHashtags: true,
    includeKeywords: limits.keywords
  };
}

async function ensurePlanSchema() {
  if (!databaseAvailable || schemaReady) return;

  try {
    await db()`
      create table if not exists plans (
        id uuid primary key,
        user_id uuid not null unique,
        plan_name text not null default 'Free',
        generation_limit integer not null default 3,
        created_at timestamptz not null default now()
      )
    `;

    await db()`
      create table if not exists generations (
        id uuid primary key,
        user_id uuid not null,
        project_id uuid null,
        summary text not null,
        video_type text not null,
        image_style text not null,
        language text not null,
        scene_count integer not null default 0,
        subtitle_lines integer not null default 0,
        status text not null,
        error text null,
        created_at timestamptz not null default now()
      )
    `;

    await db()`create index if not exists generations_user_created_at_idx on generations (user_id, created_at desc)`;
    schemaReady = true;
  } catch {
    databaseAvailable = false;
  }
}

function db() {
  if (!sql) throw new Error("Plan database is not configured.");
  return sql;
}

async function runWithFallback<T>(dbAction: () => Promise<T>, localAction: () => Promise<T>) {
  if (!databaseAvailable) return localAction();
  try {
    return await dbAction();
  } catch {
    databaseAvailable = false;
    return localAction();
  }
}

function rowToGeneration(row: GenerationRow): GenerationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    summary: row.summary,
    videoType: row.video_type,
    imageStyle: row.image_style,
    language: row.language,
    sceneCount: row.scene_count,
    subtitleLines: row.subtitle_lines,
    status: row.status,
    error: row.error,
    createdAt: new Date(row.created_at).toISOString()
  };
}

async function getLocalPlan(userId: string): Promise<PlanName> {
  const plans = await readLocalPlans();
  return plans[userId] || "Free";
}

async function readLocalPlans(): Promise<Record<string, PlanName>> {
  try {
    const content = await readFile(localPlansPath, "utf8");
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalPlans(plans: Record<string, PlanName>) {
  await mkdir(path.dirname(localPlansPath), { recursive: true });
  await writeFile(localPlansPath, JSON.stringify(plans, null, 2), "utf8");
}

async function readLocalGenerations(): Promise<GenerationRecord[]> {
  try {
    const content = await readFile(localGenerationsPath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalGenerations(rows: GenerationRecord[]) {
  await mkdir(path.dirname(localGenerationsPath), { recursive: true });
  await writeFile(localGenerationsPath, JSON.stringify(rows, null, 2), "utf8");
}
