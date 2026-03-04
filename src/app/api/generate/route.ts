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
    profile,
  } = body;

  if (!topic || !apiKey || !profile) {
    return new Response(
      JSON.stringify({ error: "必須パラメータが不足しています" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const useStreaming = process.env.DISABLE_STREAMING !== "true";

  // --- Non-streaming fallback ---
  if (!useStreaming) {
    const generateContent = await getGenerateFunction(provider);
    const platforms: Platform[] = ["x", "threads"];
    const prompts = platforms.map((p) => buildPrompt(p, topic, profile));
    const results = await Promise.all(
      prompts.map((p) => generateContent(apiKey, p.system, p.user))
    );
    const response: Record<string, PlatformResult> = {};
    platforms.forEach((p, i) => {
      response[p] = toPlatformResult(parseJSON(results[i]));
    });
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- SSE streaming ---
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const platforms: Platform[] = ["x", "threads"];
      const streamContent = await getStreamFunction(provider);

      const tasks = platforms.map(async (platform) => {
        try {
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
              encodeSSE({ platform, type: "done", result: result as unknown as Record<string, unknown> })
            )
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "生成中にエラーが発生しました";
          controller.enqueue(
            encoder.encode(encodeSSE({ platform, type: "error", message }))
          );
        }
      });

      await Promise.all(tasks);
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
