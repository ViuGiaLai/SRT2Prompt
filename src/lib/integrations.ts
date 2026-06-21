import type { ContentPack } from "./types";
import { exportAsMarkdown, exportAsText } from "./export";

type ExportFormat = "txt" | "md" | "json";

export async function exportPackToNotion(pack: ContentPack) {
  const apiKey = process.env.NOTION_API_KEY;
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!apiKey || (!parentPageId && !databaseId)) {
    throw new Error("NOTION_API_KEY and either NOTION_PARENT_PAGE_ID or NOTION_DATABASE_ID are required.");
  }

  const title = pack.titlePack.curiosity[0] || pack.titles[0] || "SRT2Prompt Content Pack";
  const blocks = buildNotionBlocks(pack);
  const parent = parentPageId ? { page_id: parentPageId } : { database_id: databaseId };
  const properties = parentPageId
    ? {
        title: {
          title: [{ text: { content: title } }]
        }
      }
    : {
        [process.env.NOTION_TITLE_PROPERTY_NAME || "Name"]: {
          title: [{ text: { content: title } }]
        }
      };
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify({
      parent,
      properties,
      children: blocks
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Notion export failed: ${message}`);
  }

  return response.json();
}

export async function exportPackToDrive(pack: ContentPack, format: ExportFormat) {
  const accessToken = await getDriveAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!accessToken || !folderId) {
    throw new Error("GOOGLE_DRIVE_ACCESS_TOKEN and GOOGLE_DRIVE_FOLDER_ID are required.");
  }

  const { name, content, mimeType } = buildDriveFile(pack, format);
  const metadata = {
    name,
    parents: [folderId]
  };
  const boundary = `-------SRT2Prompt${Date.now()}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    "",
    content,
    `--${boundary}--`
  ].join("\r\n");

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Drive export failed: ${message}`);
  }

  return response.json();
}

async function getDriveAccessToken() {
  const direct = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (direct) return direct;

  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) return "";

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    }).toString()
  });

  if (!response.ok) return "";
  const data = await response.json();
  return data?.access_token || "";
}

function buildNotionBlocks(pack: ContentPack) {
  const blocks: Array<Record<string, any>> = [];
  blocks.push(headingBlock("Summary"));
  blocks.push(paragraphBlock(pack.summary));
  blocks.push(headingBlock("Character Bible"));
  blocks.push(paragraphBlock(`Name: ${pack.characterBible.name}\nAge: ${pack.characterBible.age}\nHair: ${pack.characterBible.hair}\nClothes: ${pack.characterBible.clothes}\nPersonality: ${pack.characterBible.personality}`));
  blocks.push(headingBlock("Viral Score"));
  blocks.push(paragraphBlock(`Overall: ${pack.intelligence.viralScore.overall}/100\nSEO: ${pack.intelligence.viralScore.seo}\nCTR: ${pack.intelligence.viralScore.ctr}\nTrend: ${pack.intelligence.viralScore.trend}`));
  blocks.push(headingBlock("Storyboard"));
  for (const scene of pack.storyboard.slice(0, 10)) {
    blocks.push(paragraphBlock(`Scene ${scene.sceneRange} - ${scene.beat}\n${scene.summary}\nCamera: ${scene.cameraAngle}\nLighting: ${scene.lighting}\nEmotion: ${scene.emotion}`));
  }
  blocks.push(headingBlock("Title Pack"));
  blocks.push(paragraphBlock([...pack.titlePack.curiosity, ...pack.titlePack.fear, ...pack.titlePack.question, ...pack.titlePack.clickbait].join("\n")));
  blocks.push(headingBlock("Keywords"));
  blocks.push(paragraphBlock(pack.keywords.join(", ")));
  return blocks.slice(0, 80);
}

function headingBlock(text: string) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: text } }]
    }
  };
}

function paragraphBlock(text: string) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1800) } }]
    }
  };
}

function buildDriveFile(pack: ContentPack, format: Exclude<ExportFormat, "json"> | "json") {
  if (format === "json") {
    return {
      name: `${safeName(pack.titlePack.curiosity[0] || pack.titles[0] || "srt2prompt-pack")}.json`,
      content: JSON.stringify(pack, null, 2),
      mimeType: "application/json"
    };
  }

  if (format === "md") {
    return {
      name: `${safeName(pack.titlePack.curiosity[0] || pack.titles[0] || "srt2prompt-pack")}.md`,
      content: exportAsMarkdown(pack),
      mimeType: "text/markdown"
    };
  }

  return {
    name: `${safeName(pack.titlePack.curiosity[0] || pack.titles[0] || "srt2prompt-pack")}.txt`,
    content: exportAsText(pack),
    mimeType: "text/plain"
  };
}

function safeName(value: string) {
  return value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim()
    .slice(0, 120)
    .replace(/\s+/g, "-")
    .toLowerCase() || "srt2prompt-pack";
}
