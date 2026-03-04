"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GeneratorForm } from "@/components/generator-form";
import { OutputPanel } from "@/components/output-panel";
import type { ImageStates } from "@/components/output-panel";
import { emptyImageState } from "@/components/image-output";
import type { Platform, Provider, ImageResult } from "@/lib/types";
import { PROVIDER_OPTIONS } from "@/lib/types";
import { useStreaming } from "@/hooks/use-streaming";

function getStorageKey(provider: Provider) {
  return `media-generator-api-key-${provider}`;
}

const initialImageStates = (): ImageStates => ({
  x: emptyImageState(),
  threads: emptyImageState(),
  note: emptyImageState(),
});

export default function Home() {
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [enableImage, setEnableImage] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [imageStates, setImageStates] = useState<ImageStates>(initialImageStates);

  const { states, isGenerating, error, generate, abort } = useStreaming();

  // Track which platforms we've already triggered image gen for
  const imageTriggeredRef = useRef<Set<Platform>>(new Set());

  // Load API key for selected provider
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(provider));
    setApiKey(saved ?? "");
  }, [provider]);

  // Load Gemini API key for image gen (separate from provider key)
  useEffect(() => {
    const saved = localStorage.getItem("media-generator-gemini-image-key");
    setGeminiApiKey(saved ?? "");
  }, []);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    if (value) {
      localStorage.setItem(getStorageKey(provider), value);
    } else {
      localStorage.removeItem(getStorageKey(provider));
    }
  }

  function handleGeminiApiKeyChange(value: string) {
    setGeminiApiKey(value);
    if (value) {
      localStorage.setItem("media-generator-gemini-image-key", value);
    } else {
      localStorage.removeItem("media-generator-gemini-image-key");
    }
  }

  function handleProviderChange(value: Provider) {
    setProvider(value);
  }

  // Image generation for a single platform
  const generateImageForPlatform = useCallback(
    async (platform: Platform, content: string, customPrompt?: string) => {
      const imageApiKey = provider === "gemini" ? apiKey : geminiApiKey;
      if (!imageApiKey) return;

      setImageStates((prev) => ({
        ...prev,
        [platform]: { isGenerating: true, result: null },
      }));

      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            platform,
            provider,
            apiKey,
            geminiApiKey: provider !== "gemini" ? geminiApiKey : undefined,
            customPrompt,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "画像生成に失敗しました");
        }

        const data: ImageResult = await res.json();
        setImageStates((prev) => ({
          ...prev,
          [platform]: { isGenerating: false, result: data },
        }));
      } catch (err) {
        setImageStates((prev) => ({
          ...prev,
          [platform]: {
            isGenerating: false,
            result: null,
            error: err instanceof Error ? err.message : "画像生成エラー",
          },
        }));
      }
    },
    [apiKey, geminiApiKey, provider]
  );

  // Watch for text completion → trigger image generation
  useEffect(() => {
    if (!enableImage) return;

    // Image generation is note-only (diagrams for article eyecatch)
    const st = states.note;
    if (
      st.isDone &&
      st.result &&
      !imageTriggeredRef.current.has("note")
    ) {
      imageTriggeredRef.current.add("note");
      generateImageForPlatform("note", st.result.content);
    }
  }, [states, enableImage, generateImageForPlatform]);

  const handleGenerate = useCallback(() => {
    // Reset image states and triggers
    setImageStates(initialImageStates());
    imageTriggeredRef.current = new Set();

    generate({
      url: "/api/generate",
      body: { topic, apiKey, provider },
    });
  }, [generate, topic, apiKey, provider]);

  const handleRegenerate = useCallback(
    (platform: Platform) => {
      // Reset image for this platform
      imageTriggeredRef.current.delete(platform);
      setImageStates((prev) => ({
        ...prev,
        [platform]: emptyImageState(),
      }));

      generate({
        url: "/api/regenerate",
        body: { topic, apiKey, provider, platform },
        platforms: [platform],
      });
    },
    [generate, topic, apiKey, provider]
  );

  const handleRegenerateImage = useCallback(
    (platform: Platform, customPrompt?: string) => {
      const content = states[platform].result?.content;
      if (!content) return;
      generateImageForPlatform(platform, content, customPrompt);
    },
    [states, generateImageForPlatform]
  );

  const currentProvider = PROVIDER_OPTIONS.find((p) => p.value === provider)!;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-amber-900 mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            Powered by {currentProvider.label}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-amber-950">
            1ネタ → 3メディア展開
          </h1>
          <p className="mt-3 text-amber-800/80 text-sm sm:text-base max-w-lg mx-auto">
            1つのネタから X / Threads / note に最適化された投稿を一括生成
          </p>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" className="fill-background" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Input */}
        <div className="max-w-2xl mx-auto -mt-6">
          <GeneratorForm
            topic={topic}
            apiKey={apiKey}
            provider={provider}
            enableImage={enableImage}
            geminiApiKey={geminiApiKey}
            onTopicChange={setTopic}
            onApiKeyChange={handleApiKeyChange}
            onProviderChange={handleProviderChange}
            onEnableImageChange={setEnableImage}
            onGeminiApiKeyChange={handleGeminiApiKeyChange}
            onSubmit={handleGenerate}
            onAbort={abort}
            isGenerating={isGenerating}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Output */}
        <OutputPanel
          states={states}
          isGenerating={isGenerating}
          imageStates={enableImage ? imageStates : undefined}
          onRegenerate={handleRegenerate}
          onRegenerateImage={enableImage ? handleRegenerateImage : undefined}
        />
      </div>
    </main>
  );
}
