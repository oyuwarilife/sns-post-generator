"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratorForm } from "@/components/generator-form";
import { OutputPanel } from "@/components/output-panel";
import { ProfileSelector } from "@/components/profile-selector";
import { PostBothButton } from "@/components/post-both-button";
import type { Platform, Provider, UserProfile } from "@/lib/types";
import { PROVIDER_OPTIONS, PRESETS } from "@/lib/types";
import { useStreaming } from "@/hooks/use-streaming";

const PROFILE_STORAGE_KEY = "sns-post-generator-profile";

function getStorageKey(provider: Provider) {
  return `sns-post-generator-api-key-${provider}`;
}

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return PRESETS[0];
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return PRESETS[0];
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [profile, setProfile] = useState<UserProfile>(PRESETS[0]);

  const { states, isGenerating, error, generate, abort } = useStreaming();

  // Load profile from localStorage
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  // Load API key for selected provider
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(provider));
    setApiKey(saved ?? "");
  }, [provider]);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    if (value) {
      localStorage.setItem(getStorageKey(provider), value);
    } else {
      localStorage.removeItem(getStorageKey(provider));
    }
  }

  function handleProviderChange(value: Provider) {
    setProvider(value);
  }

  function handleProfileChange(newProfile: UserProfile) {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
  }

  const handleGenerate = useCallback(() => {
    generate({
      url: "/api/generate",
      body: { topic, apiKey, provider, profile },
    });
  }, [generate, topic, apiKey, provider, profile]);

  const handleRegenerate = useCallback(
    (platform: Platform) => {
      generate({
        url: "/api/regenerate",
        body: { topic, apiKey, provider, platform, profile },
        platforms: [platform],
      });
    },
    [generate, topic, apiKey, provider, profile]
  );

  const currentProvider = PROVIDER_OPTIONS.find((p) => p.value === provider)!;

  const xResult = states.x.isDone && states.x.result ? states.x.result.content : null;
  const threadsResult = states.threads.isDone && states.threads.result ? states.threads.result.content : null;
  const bothDone = xResult !== null && threadsResult !== null;

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
            X × Threads 同時投稿つくるくん
          </h1>
          <p className="mt-3 text-amber-800/80 text-sm sm:text-base max-w-lg mx-auto">
            1つのネタから X と Threads に最適化された投稿を同時生成
          </p>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" className="fill-background" />
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Profile */}
        <div className="max-w-2xl mx-auto -mt-6">
          <ProfileSelector profile={profile} onChange={handleProfileChange} />
        </div>

        {/* Input */}
        <div className="max-w-2xl mx-auto">
          <GeneratorForm
            topic={topic}
            apiKey={apiKey}
            provider={provider}
            onTopicChange={setTopic}
            onApiKeyChange={handleApiKeyChange}
            onProviderChange={handleProviderChange}
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
          onRegenerate={handleRegenerate}
        />

        {/* Post Both */}
        {bothDone && (
          <div className="max-w-md mx-auto">
            <PostBothButton xText={xResult} threadsText={threadsResult} />
          </div>
        )}
      </div>
    </main>
  );
}
