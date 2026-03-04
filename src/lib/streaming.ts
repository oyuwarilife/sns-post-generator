import type { Platform, Provider } from "./types";

// --- SSE helpers ---

export type SSEEvent =
  | { platform: Platform; type: "chunk"; text: string }
  | { platform: Platform; type: "done"; result: Record<string, unknown> }
  | { platform: Platform; type: "error"; message: string };

export function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// --- Content extraction from streaming JSON ---

/**
 * Extracts the "content" field value from a partially-streamed JSON string.
 * Returns the decoded content found so far.
 */
export function extractContentFromPartial(accumulated: string): string {
  // Strip markdown code block wrapper
  const cleaned = accumulated
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "");

  const marker = /"content"\s*:\s*"/;
  const match = marker.exec(cleaned);
  if (!match) return "";

  const start = match.index + match[0].length;
  const rest = cleaned.slice(start);

  let result = "";
  let i = 0;
  while (i < rest.length) {
    if (rest[i] === "\\" && i + 1 < rest.length) {
      const next = rest[i + 1];
      if (next === "n") result += "\n";
      else if (next === '"') result += '"';
      else if (next === "\\") result += "\\";
      else if (next === "t") result += "\t";
      else result += next;
      i += 2;
    } else if (rest[i] === '"') {
      break; // End of content string
    } else {
      result += rest[i];
      i++;
    }
  }

  return result;
}

// --- Parse final JSON ---

export function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(cleaned);
}

// --- Provider routing ---

export function getStreamFunction(provider: Provider) {
  // Dynamic imports to keep this module lean; callers await the result.
  switch (provider) {
    case "anthropic":
      return import("./anthropic").then((m) => m.streamContent);
    case "openai":
      return import("./openai").then((m) => m.streamContent);
    case "gemini":
    default:
      return import("./gemini").then((m) => m.streamContent);
  }
}

export function getGenerateFunction(provider: Provider) {
  switch (provider) {
    case "anthropic":
      return import("./anthropic").then((m) => m.generateContent);
    case "openai":
      return import("./openai").then((m) => m.generateContent);
    case "gemini":
    default:
      return import("./gemini").then((m) => m.generateContent);
  }
}
