"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformOutput } from "@/components/platform-output";
import type { Platform } from "@/lib/types";
import type { StreamStates } from "@/hooks/use-streaming";

const PLATFORMS: Platform[] = ["x", "threads"];

function hasAnyActivity(states: StreamStates): boolean {
  return PLATFORMS.some(
    (p) => states[p].isStreaming || states[p].isDone || states[p].text.length > 0
  );
}

export function OutputPanel({
  states,
  isGenerating,
  onRegenerate,
}: {
  states: StreamStates;
  isGenerating: boolean;
  onRegenerate?: (platform: Platform) => void;
}) {
  if (!hasAnyActivity(states) && !isGenerating) {
    return null;
  }

  return (
    <>
      {/* Desktop: 2-column grid */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-5">
        {PLATFORMS.map((p) => (
          <PlatformOutput
            key={p}
            platform={p}
            streamState={states[p]}
            onRegenerate={onRegenerate}
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
          </TabsList>
          {PLATFORMS.map((p) => (
            <TabsContent key={p} value={p} className="mt-4">
              <PlatformOutput
                platform={p}
                streamState={states[p]}
                onRegenerate={onRegenerate}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
