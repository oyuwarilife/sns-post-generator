import { buildXPrompt } from "@/lib/prompts/x-post";
import { buildThreadsPrompt } from "@/lib/prompts/threads-post";
import {
  encodeSSE,
  extractContentFromPartial,
  parseJSON,
  getStreamFunction,
  getGenerateFunction,
} from "@/lib/streaming";
import type { Platform, PlatformResult, Provider, UserProfile } from "@/lib/types";

export const runtime = "edge";

function toPlatformResult(parsed: Record<string, unknown>): PlatformResult {
  const content = String(parsed.content ?? "");
  return {
    content,
    title: parsed.title ? String(parsed.title) : undefined,
    pattern: String(parsed.pattern ?? "自動判定"),
    axis: String(parsed.axis ?? ""),
    score: Number(parsed.score ?? 70),
    charCount: content.length,
    role: String(parsed.role ?? ""),
  };
}

function buildPrompt(platform: Platform, topic: string, profile: UserProfile) {
  switch (platform) {
    case "x":
      return buildXPrompt(topic, profile);
    case "threads":
      return buildThreadsPrompt(topic, profile);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    topic,
    apiKey,
    provider = "gemini" as Provider,
    platform,
    profile,
  } = body;

  if (!topic || !apiKey || !platform || !profile) {
    return new Response(
      JSON.stringify({ error: "必須パラメータが不足しています" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const useStreaming = process.env.DISABLE_STREAMING !== "true";

  // --- Non-streaming fallback ---
  if (!useStreaming) {
    const generateContent = await getGenerateFunction(provider);
    const prompt = buildPrompt(platform, topic, profile);
    const raw = await generateContent(apiKey, prompt.system, prompt.user);
    const result = toPlatformResult(parseJSON(raw));
    return new Response(JSON.stringify({ platform, result }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- SSE streaming ---
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamContent = await getStreamFunction(provider);
        const prompt = buildPrompt(platform, topic, profile);
        let accumulated = "";
        let lastSentLength = 0;

        for await (const chunk of streamContent(
          apiKey,
          prompt.system,
          prompt.user
        )) {
          accumulated += chunk;

          const content = extractContentFromPartial(accumulated);
          if (content.length > lastSentLength) {
            const newText = content.slice(lastSentLength);
            lastSentLength = content.length;
            controller.enqueue(
              encoder.encode(
                encodeSSE({ platform, type: "chunk", text: newText })
              )
            );
          }
        }

        const parsed = parseJSON(accumulated);
        const result = toPlatformResult(parsed);
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              platform,
              type: "done",
              result: result as unknown as Record<string, unknown>,
            })
          )
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "再生成中にエラーが発生しました";
        controller.enqueue(
          encoder.encode(encodeSSE({ platform, type: "error", message }))
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
