export async function callGemini(systemInstruction: string, prompt: string, temperature = 0.7): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    let message = `Gemini API error (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) {
        message = errorBody.error.message;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) message += `: ${text}`;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = extractGeminiText(data);
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseJson(text);
}

function extractGeminiText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  const textParts = parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean);
  return textParts.join("\n").trim();
}

function parseJson(text: string): any {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
    : trimmed;
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse JSON from Gemini response:", text);
    throw new Error("Invalid JSON structure returned by AI model.");
  }
}
