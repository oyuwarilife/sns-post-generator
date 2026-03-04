"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformOutput } from "@/components/platform-output";
import type { Platform } from "@/lib/types";
import type { StreamStates } from "@/hooks/use-streaming";
import type { ImageState } from "@/components/image-output";

const PLATFORMS: Platform[] = ["x", "threads", "note"];

function hasAnyActivity(states: StreamStates): boolean {
  return PLATFORMS.some(
    (p) => states[p].isStreaming || states[p].isDone || states[p].text.length > 0
  );
}

export type ImageStates = Record<Platform, ImageState>;

export function OutputPanel({
  states,
  isGenerating,
  imageStates,
  onRegenerate,
  onRegenerateImage,
}: {
  states: StreamStates;
  isGenerating: boolean;
  imageStates?: ImageStates;
  onRegenerate?: (platform: Platform) => void;
  onRegenerateImage?: (platform: Platform, customPrompt?: string) => void;
}) {
  if (!hasAnyActivity(states) && !isGenerating) {
    return null;
  }

  return (
    <>
      {/* Desktop: 3-column grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5">
        {PLATFORMS.map((p) => (
          <PlatformOutput
            key={p}
            platform={p}
            streamState={states[p]}
            imageState={imageStates?.[p]}
            onRegenerate={onRegenerate}
            onRegenerateImage={onRegenerateImage}
          />
        ))}
      </div>

      {/* Mobile: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="x">
          <TabsList className="w-full bg-amber-100/60 border border-amber-200/50 rounded-xl p-1">
            <TabsTrigger
              value="x"
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              𝕏
            </TabsTrigger>
            <TabsTrigger
              value="threads"
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              Threads
            </TabsTrigger>
            <TabsTrigger
              value="note"
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              note
            </TabsTrigger>
          </TabsList>
          {PLATFORMS.map((p) => (
            <TabsContent key={p} value={p} className="mt-4">
              <PlatformOutput
                platform={p}
                streamState={states[p]}
                imageState={imageStates?.[p]}
                onRegenerate={onRegenerate}
                onRegenerateImage={onRegenerateImage}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
