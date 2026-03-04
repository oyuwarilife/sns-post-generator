"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/lib/types";
import { PROVIDER_OPTIONS } from "@/lib/types";

interface GeneratorFormProps {
  topic: string;
  apiKey: string;
  provider: Provider;
  enableImage: boolean;
  geminiApiKey: string;
  onTopicChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onProviderChange: (value: Provider) => void;
  onEnableImageChange: (value: boolean) => void;
  onGeminiApiKeyChange: (value: string) => void;
  onSubmit: () => void;
  onAbort?: () => void;
  isGenerating: boolean;
}

export function GeneratorForm({
  topic,
  apiKey,
  provider,
  enableImage,
  geminiApiKey,
  onTopicChange,
  onApiKeyChange,
  onProviderChange,
  onEnableImageChange,
  onGeminiApiKeyChange,
  onSubmit,
  onAbort,
  isGenerating,
}: GeneratorFormProps) {
  const [showKey, setShowKey] = useState(false);
  const currentProvider = PROVIDER_OPTIONS.find((p) => p.value === provider)!;

  return (
    <div className="rounded-2xl bg-card shadow-lg shadow-amber-200/30 border border-amber-200/50 p-6 sm:p-8 space-y-5">
      {/* Provider Selector */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          AIプロバイダー
        </label>
        <div className="flex gap-2">
          {PROVIDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onProviderChange(opt.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                provider === opt.value
                  ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm"
                  : "bg-background border-input text-muted-foreground hover:border-amber-300 hover:text-foreground"
              }`}
            >
              <span className="block">{opt.label}</span>
              <span className="block text-[10px] opacity-70">{opt.model}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div>
        <label
          htmlFor="apiKey"
          className="block text-sm font-medium mb-2 text-foreground"
        >
          {currentProvider.label} API Key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showKey ? "text" : "password"}
            placeholder={currentProvider.placeholder}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 pr-16 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showKey ? "隠す" : "表示"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          ブラウザのlocalStorageに保存されます（サーバーには保存されません）
        </p>
      </div>

      {/* Topic */}
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium mb-2 text-foreground"
        >
          ネタを入力
        </label>
        <Textarea
          id="topic"
          placeholder={"体験・気づき・ノウハウなど、投稿のネタを入力してください。\n\n例: 息子が半年ぶりに「買い物行きたい」と言ってきた。不登校になってからずっと部屋にいたのに。"}
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          rows={5}
          className="resize-none text-base focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-muted-foreground">
            {topic.length}文字
          </p>
          <div className="flex gap-1">
            {["X", "Threads", "note"].map((p) => (
              <span
                key={p}
                className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Image Toggle */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={enableImage}
            onClick={() => onEnableImageChange(!enableImage)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              enableImage ? "bg-amber-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                enableImage ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-foreground">
            note用の図解も生成する
          </span>
        </label>
        {enableImage && provider !== "gemini" && (
          <div>
            <label
              htmlFor="geminiApiKey"
              className="block text-xs font-medium mb-1.5 text-amber-700"
            >
              画像生成用 Gemini API Key
            </label>
            <input
              id="geminiApiKey"
              type="password"
              placeholder="AIza..."
              value={geminiApiKey}
              onChange={(e) => onGeminiApiKeyChange(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
            />
            <p className="text-[11px] text-amber-600 mt-1">
              画像生成にはGemini APIキーが必要です（テキスト生成とは別）
            </p>
          </div>
        )}
      </div>

      {isGenerating ? (
        <Button
          onClick={onAbort}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white shadow-md shadow-red-300/30 transition-all duration-200"
          size="lg"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            中断する
          </span>
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={topic.trim().length === 0 || apiKey.trim().length === 0}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 shadow-md shadow-amber-300/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-300/40 disabled:opacity-50 disabled:shadow-none"
          size="lg"
        >
          3メディアで展開する
        </Button>
      )}
    </div>
  );
}
