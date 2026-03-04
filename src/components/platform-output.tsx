"use client";

import { CopyButton } from "@/components/copy-button";
import { PostToXButton } from "@/components/post-to-x-button";
import { PostToThreadsButton } from "@/components/post-to-threads-button";
import type { Platform } from "@/lib/types";
import type { PlatformStreamState } from "@/hooks/use-streaming";

const platformConfig: Record<
  Platform,
  { label: string; icon: string; gradient: string; accent: string }
> = {
  x: {
    label: "X (Twitter)",
    icon: "𝕏",
    gradient: "from-neutral-800 to-neutral-900",
    accent: "text-neutral-100",
  },
  threads: {
    label: "Threads",
    icon: "@",
    gradient: "from-fuchsia-600 to-purple-700",
    accent: "text-fuchsia-100",
  },
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-amber-400 text-amber-950"
      : score >= 70
        ? "bg-amber-200 text-amber-800"
        : "bg-red-100 text-red-700";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}
    >
      {score}点
    </span>
  );
}

function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[1.1em] bg-amber-500 align-middle animate-pulse ml-0.5" />
  );
}

export function PlatformOutput({
  platform,
  streamState,
  onRegenerate,
}: {
  platform: Platform;
  streamState: PlatformStreamState;
  onRegenerate?: (platform: Platform) => void;
}) {
  const config = platformConfig[platform];
  const { text, isStreaming, isDone, result, error } = streamState;

  // Nothing to show yet
  if (!isStreaming && !isDone && !text) return null;

  const hasResult = isDone && result;
  const displayContent = hasResult ? result.content : text;

  return (
    <div className="rounded-2xl bg-card shadow-md shadow-amber-100/50 border border-amber-100/80 overflow-hidden transition-all hover:shadow-lg hover:shadow-amber-200/40">
      {/* Platform Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-5 py-3.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`text-xl font-bold ${config.accent}`}>
              {config.icon}
            </span>
            <span className={`text-sm font-bold ${config.accent}`}>
              {config.label}
            </span>
            {isStreaming && (
              <span className={`text-xs ${config.accent} opacity-60`}>
                生成中...
              </span>
            )}
          </div>
          {hasResult && (
            <div className="flex items-center gap-2">
              <ScoreBadge score={result.score} />
              <span className={`text-xs ${config.accent} opacity-80`}>
                {result.charCount}文字
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Meta (only after completion) */}
      {hasResult && (
        <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5">
          {result.pattern && (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              {result.pattern}
            </span>
          )}
          {result.axis && (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              {result.axis}
            </span>
          )}
          {result.role && (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              {result.role}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-5 pb-4 pt-3">
        {error ? (
          <div className="text-sm text-red-600 mb-4">{error}</div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 mb-4">
            {displayContent}
            {isStreaming && <StreamingCursor />}
          </div>
        )}

        {/* Actions (only after completion) */}
        {isDone && !error && result && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary: Post button */}
            {platform === "x" && (
              <PostToXButton text={result.content} />
            )}
            {platform === "threads" && (
              <PostToThreadsButton text={result.content} />
            )}
            {/* Secondary: Copy & Regenerate */}
            <CopyButton text={result.content} />
            {onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(platform)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
              >
                再生成
              </button>
            )}
          </div>
        )}

        {/* Retry on error */}
        {isDone && error && onRegenerate && (
          <button
            type="button"
            onClick={() => onRegenerate(platform)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            リトライ
          </button>
        )}
      </div>
    </div>
  );
}
