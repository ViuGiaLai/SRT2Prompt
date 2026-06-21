import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import type { CharacterBible, ContentPack, InputType, Project, StoryBeat, StoryboardScene, TitlePack } from "./types";

const connectionString = process.env.DATABASE_URL;
const hasUsableDatabaseUrl =
  Boolean(connectionString) &&
  !connectionString?.includes("[YOUR-PASSWORD]") &&
  !connectionString?.includes("YOUR_SUPABASE_DATABASE_PASSWORD");
const sql = hasUsableDatabaseUrl && connectionString
  ? postgres(connectionString, {
      max: 3,
      ssl: connectionString.includes("supabase.co") ? "require" : undefined
    })
  : null;

let schemaReady = false;
let databaseAvailable = Boolean(sql);

type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  input_text: string;
  input_type: InputType;
  video_type: string;
  image_style: string;
  language: string;
  scene_count: number;
  content_pack: ContentPack;
  created_at: Date | string;
  updated_at: Date | string;
};

export async function listProjects(userId: string) {
  return runWithFallback(async () => {
    await ensureSchema();
    const rows = await db()`
      select
        id,
        user_id,
        title,
        input_text,
        input_type,
        video_type,
        image_style,
        language,
        scene_count,
        content_pack,
        created_at,
        updated_at
      from projects
      where user_id = ${userId}
      order by updated_at desc
    `;
    return (rows as unknown as ProjectRow[]).map(rowToProject);
  }, async () => listLocalProjects(userId));
}

export async function getProject(id: string, userId: string) {
  return runWithFallback(async () => {
    await ensureSchema();
    const rows = await db()`
      select
        id,
        user_id,
        title,
        input_text,
        input_type,
        video_type,
        image_style,
        language,
        scene_count,
        content_pack,
        created_at,
        updated_at
      from projects
      where id = ${id}
        and user_id = ${userId}
      limit 1
    `;
    return rows[0] ? rowToProject(rows[0] as unknown as ProjectRow) : null;
  }, async () => getLocalProject(id, userId));
}

export async function saveProject(input: {
  userId: string;
  title: string;
  inputText: string;
  inputType: InputType;
  videoType: string;
  imageStyle: string;
  language: string;
  sceneCount: number;
  contentPack: ContentPack;
}) {
  return runWithFallback(async () => {
    await ensureSchema();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const rows = await db()`
      insert into projects (
        id,
        user_id,
        title,
        input_text,
        input_type,
        video_type,
        image_style,
        language,
        scene_count,
        content_pack,
        created_at,
        updated_at
      )
      values (
        ${id},
        ${input.userId},
        ${input.title},
        ${input.inputText},
        ${input.inputType},
        ${input.videoType},
        ${input.imageStyle},
        ${input.language},
        ${input.sceneCount},
        ${JSON.stringify(input.contentPack)}::jsonb,
        ${now},
        ${now}
      )
      returning
        id,
        user_id,
        title,
        input_text,
        input_type,
        video_type,
        image_style,
        language,
        scene_count,
        content_pack,
        created_at,
        updated_at
    `;

    return rowToProject(rows[0] as unknown as ProjectRow);
  }, async () => saveLocalProject(input));
}

export async function duplicateProject(id: string, userId: string) {
  const project = await getProject(id, userId);
  if (!project) return null;

  return saveProject({
    userId,
    title: `${project.title} Copy`,
    inputText: project.inputText,
    inputType: project.inputType,
    videoType: project.videoType,
    imageStyle: project.imageStyle,
    language: project.language,
    sceneCount: project.sceneCount,
    contentPack: project.contentPack
  });
}

export async function deleteProject(id: string, userId: string) {
  return runWithFallback(async () => {
    await ensureSchema();
    const rows = await db()`
      delete from projects
      where id = ${id}
        and user_id = ${userId}
      returning id
    `;
    return rows.length > 0;
  }, async () => deleteLocalProject(id, userId));
}

export async function updateProjectContent(id: string, userId: string, contentPack: ContentPack) {
  return runWithFallback(async () => {
    await ensureSchema();
    const rows = await db()`
      update projects
      set content_pack = ${JSON.stringify(contentPack)}::jsonb,
          scene_count = ${contentPack.scenePrompts.length},
          updated_at = ${new Date().toISOString()}
      where id = ${id}
        and user_id = ${userId}
      returning
        id,
        user_id,
        title,
        input_text,
        input_type,
        video_type,
        image_style,
        language,
        scene_count,
        content_pack,
        created_at,
        updated_at
    `;
    return rows[0] ? rowToProject(rows[0] as unknown as ProjectRow) : null;
  }, async () => updateLocalProjectContent(id, userId, contentPack));
}

async function ensureSchema() {
  if (!databaseAvailable) return;
  if (schemaReady) return;

  try {
    await db()`
      create table if not exists projects (
        id uuid primary key,
        user_id uuid not null,
        title text not null,
        input_text text not null,
        input_type text not null,
        video_type text not null,
        image_style text not null,
        language text not null,
        scene_count integer not null default 0,
        content_pack jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;

    await db()`alter table projects add column if not exists user_id uuid`;
    await db()`update projects set user_id = '00000000-0000-0000-0000-000000000000' where user_id is null`;
    await db()`alter table projects alter column user_id set not null`;
    await db()`create index if not exists projects_updated_at_idx on projects (updated_at desc)`;
    await db()`create index if not exists projects_user_updated_at_idx on projects (user_id, updated_at desc)`;
    schemaReady = true;
  } catch {
    databaseAvailable = false;
  }
}

function db() {
  if (!sql) {
    throw new Error("Project database is not configured.");
  }
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

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    inputText: row.input_text,
    inputType: row.input_type,
    videoType: row.video_type,
    imageStyle: row.image_style,
    language: row.language,
    sceneCount: row.scene_count,
    contentPack: normalizeContentPack(row.content_pack),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

const localStorePath = path.join(process.cwd(), "data", "projects.json");

async function listLocalProjects(userId: string) {
  const projects = await readLocalProjects();
  return projects
    .filter((project) => project.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function getLocalProject(id: string, userId: string) {
  const projects = await readLocalProjects();
  return projects.find((project) => project.id === id && project.userId === userId) || null;
}

async function deleteLocalProject(id: string, userId: string) {
  const projects = await readLocalProjects();
  const nextProjects = projects.filter((project) => !(project.id === id && project.userId === userId));
  await writeLocalProjects(nextProjects);
  return nextProjects.length !== projects.length;
}

async function updateLocalProjectContent(id: string, userId: string, contentPack: ContentPack) {
  const projects = await readLocalProjects();
  const index = projects.findIndex((project) => project.id === id && project.userId === userId);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    contentPack,
    sceneCount: contentPack.scenePrompts.length,
    updatedAt: new Date().toISOString()
  };
  await writeLocalProjects(projects);
  return projects[index];
}

async function saveLocalProject(input: {
  title: string;
  inputText: string;
  inputType: InputType;
  videoType: string;
  imageStyle: string;
  language: string;
  sceneCount: number;
  contentPack: ContentPack;
  userId: string;
}) {
  const projects = await readLocalProjects();
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    userId: input.userId,
    title: input.title,
    inputText: input.inputText,
    inputType: input.inputType,
    videoType: input.videoType,
    imageStyle: input.imageStyle,
    language: input.language,
    sceneCount: input.sceneCount,
    contentPack: input.contentPack,
    createdAt: now,
    updatedAt: now
  };

  projects.unshift(project);
  await writeLocalProjects(projects);
  return project;
}

async function readLocalProjects(): Promise<Project[]> {
  try {
    const content = await readFile(localStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed)
      ? parsed.map((project) => ({
          ...project,
          contentPack: normalizeContentPack(project.contentPack)
        }))
      : [];
  } catch {
    return [];
  }
}

async function writeLocalProjects(projects: Project[]) {
  await mkdir(path.dirname(localStorePath), { recursive: true });
  await writeFile(localStorePath, JSON.stringify(projects, null, 2), "utf8");
}

function normalizeContentPack(contentPack: Partial<ContentPack> | undefined): ContentPack {
  const fallbackCharacterBible: CharacterBible = {
    name: "Main Character",
    age: "Adult",
    gender: "Unspecified",
    hair: "Consistent dark hair",
    clothes: "Scene-matched wardrobe",
    personality: "Stable visual identity",
    consistencyNotes: "Keep the same face, hair, clothing, and proportions across every scene."
  };

  const emptyStoryScene: StoryboardScene = {
    sceneRange: "1",
    timestamp: "Script segment",
    beat: "Opening",
    summary: "",
    imagePrompt: "",
    cameraAngle: "Wide establishing shot",
    lighting: "Cinematic lighting",
    emotion: "Curious"
  };

  const titlePack: TitlePack = {
    curiosity: contentPack?.titlePack?.curiosity || [],
    fear: contentPack?.titlePack?.fear || [],
    question: contentPack?.titlePack?.question || [],
    clickbait: contentPack?.titlePack?.clickbait || []
  };
  const scenePrompts = (contentPack?.scenePrompts || []).map((scene, index) => ({
    ...emptyStoryScene,
    ...scene,
    beat: scene.beat || emptyStoryScene.beat,
    cameraAngle: scene.cameraAngle || emptyStoryScene.cameraAngle,
    lighting: scene.lighting || emptyStoryScene.lighting,
    emotion: scene.emotion || emptyStoryScene.emotion,
    sceneRange: scene.sceneRange || String(index + 1),
    timestamp: scene.timestamp || emptyStoryScene.timestamp
  }));

  const storyboard = (contentPack?.storyboard || scenePrompts).map((scene, index) => ({
    ...emptyStoryScene,
    ...scene,
    beat: scene.beat || emptyStoryScene.beat,
    cameraAngle: scene.cameraAngle || emptyStoryScene.cameraAngle,
    lighting: scene.lighting || emptyStoryScene.lighting,
    emotion: scene.emotion || emptyStoryScene.emotion,
    sceneRange: scene.sceneRange || String(index + 1),
    timestamp: scene.timestamp || emptyStoryScene.timestamp
  }));

  return {
    summary: contentPack?.summary || "Generated content pack summary.",
    videoType: contentPack?.videoType || "Horror Story",
    imageStyle: contentPack?.imageStyle || "Dark Cinematic",
    language: contentPack?.language || "English",
    characterBible: contentPack?.characterBible || fallbackCharacterBible,
    scenePrompts,
    storyboard,
    thumbnail: contentPack?.thumbnail || {
      prompt: "",
      textOverlay: "",
      compositionNotes: ""
    },
    titlePack,
    titles: contentPack?.titles || [...titlePack.curiosity, ...titlePack.fear, ...titlePack.question, ...titlePack.clickbait],
    description: contentPack?.description || "",
    hashtags: contentPack?.hashtags || [],
    keywords: contentPack?.keywords || []
  };
}
