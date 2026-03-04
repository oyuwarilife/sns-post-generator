"use client";

import { useCallback, useRef, useState } from "react";
import type { Platform, PlatformResult } from "@/lib/types";

export type PlatformStreamState = {
  text: string;
  isStreaming: boolean;
  isDone: boolean;
  result: PlatformResult | null;
  error?: string;
};

const emptyState = (): PlatformStreamState => ({
  text: "",
  isStreaming: false,
  isDone: false,
  result: null,
});

export type StreamStates = Record<Platform, PlatformStreamState>;

const initialStates = (): StreamStates => ({
  x: emptyState(),
  threads: emptyState(),
});

type SSEEvent =
  | { platform: Platform; type: "chunk"; text: string }
  | { platform: Platform; type: "done"; result: PlatformResult }
  | { platform: Platform; type: "error"; message: string };

async function consumeSSE(
  response: Response,
  onEvent: (event: SSEEvent) => void
) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6)) as SSEEvent;
          onEvent(event);
        } catch {
          // skip malformed
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.startsWith("data: ")) {
    try {
      const event = JSON.parse(buffer.slice(6)) as SSEEvent;
      onEvent(event);
    } catch {
      // skip
    }
  }
}

export function useStreaming() {
  const [states, setStates] = useState<StreamStates>(initialStates);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updatePlatform = useCallback(
    (platform: Platform, updater: (prev: PlatformStreamState) => PlatformStreamState) => {
      setStates((prev) => ({
        ...prev,
        [platform]: updater(prev[platform]),
      }));
    },
    []
  );

  const generate = useCallback(
    async (params: {
      url: string;
      body: Record<string, unknown>;
      platforms?: Platform[];
    }) => {
      const { url, body, platforms = ["x", "threads"] } = params;

      // Abort previous
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setIsGenerating(true);

      // Reset states for target platforms
      setStates((prev) => {
        const next = { ...prev };
        for (const p of platforms) {
          next[p] = { ...emptyState(), isStreaming: true };
        }
        return next;
      });

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const contentType = res.headers.get("content-type") ?? "";
        const isJSON = contentType.includes("application/json");

        if (!res.ok) {
          if (isJSON) {
            const data = await res.json();
            throw new Error(data.error || "生成に失敗しました");
          }
          throw new Error("生成に失敗しました");
        }

        if (!isJSON) {
          // SSE streaming (default for generate/regenerate)
          await consumeSSE(res, (event) => {
            if (controller.signal.aborted) return;

            switch (event.type) {
              case "chunk":
                updatePlatform(event.platform, (prev) => ({
                  ...prev,
                  text: prev.text + event.text,
                }));
                break;
              case "done":
                updatePlatform(event.platform, () => ({
                  text: "",
                  isStreaming: false,
                  isDone: true,
                  result: event.result,
                }));
                break;
              case "error":
                updatePlatform(event.platform, (prev) => ({
                  ...prev,
                  isStreaming: false,
                  isDone: true,
                  error: event.message,
                }));
                break;
            }
          });
        } else {
          // JSON fallback (DISABLE_STREAMING)
          const data = await res.json();
          if (data.platform && data.result) {
            // regenerate response
            updatePlatform(data.platform, () => ({
              text: "",
              isStreaming: false,
              isDone: true,
              result: data.result,
            }));
          } else {
            // generate response (x, threads, note)
            for (const p of platforms) {
              if (data[p]) {
                updatePlatform(p as Platform, () => ({
                  text: "",
                  isStreaming: false,
                  isDone: true,
                  result: data[p],
                }));
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "エラーが発生しました";
        setError(message);
        // Mark streaming platforms as done with error
        for (const p of platforms) {
          updatePlatform(p, (prev) =>
            prev.isStreaming
              ? { ...prev, isStreaming: false, isDone: true, error: message }
              : prev
          );
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [updatePlatform]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStates((prev) => {
      const next = { ...prev };
      for (const p of ["x", "threads"] as Platform[]) {
        if (next[p].isStreaming) {
          next[p] = { ...next[p], isStreaming: false, isDone: true };
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStates(initialStates());
    setError(null);
    setIsGenerating(false);
  }, []);

  return { states, isGenerating, error, generate, abort, reset };
}
