"use client";

import { useState } from "react";
import type { UserProfile, Tone } from "@/lib/types";
import { PRESETS, TONE_LABELS } from "@/lib/types";

interface ProfileSelectorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function ProfileSelector({ profile, onChange }: ProfileSelectorProps) {
  const [isCustom, setIsCustom] = useState(
    !PRESETS.some((p) => p.name === profile.name)
  );
  const [showDetail, setShowDetail] = useState(false);

  const handlePresetSelect = (preset: UserProfile) => {
    setIsCustom(false);
    onChange(preset);
  };

  const handleCustom = () => {
    setIsCustom(true);
    setShowDetail(true);
    if (PRESETS.some((p) => p.name === profile.name)) {
      onChange({ ...profile, name: "⚙️ カスタム" });
    }
  };

  const update = (partial: Partial<UserProfile>) => {
    onChange({ ...profile, ...partial });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        プロフィール
      </label>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handlePresetSelect(preset)}
            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
              !isCustom && profile.name === preset.name
                ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm"
                : "bg-background border-input text-muted-foreground hover:border-amber-300"
            }`}
          >
            {preset.name}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustom}
          className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
            isCustom
              ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm"
              : "bg-background border-input text-muted-foreground hover:border-amber-300"
          }`}
        >
          ⚙️ カスタム
        </button>
      </div>

      {/* Selected profile summary */}
      {!isCustom && (
        <button
          type="button"
          onClick={() => setShowDetail(!showDetail)}
          className="w-full text-left px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-700"
        >
          <span className="font-medium">{profile.genre}</span>
          <span className="mx-1.5">·</span>
          <span>{TONE_LABELS[profile.tone]}</span>
          <span className="mx-1.5">·</span>
          <span>{profile.target}</span>
          <span className="float-right text-amber-400">
            {showDetail ? "▲" : "▼"}
          </span>
        </button>
      )}

      {/* Custom / Detail form */}
      {(isCustom || showDetail) && (
        <div className="space-y-3 rounded-lg border border-amber-200/50 bg-amber-50/30 p-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              発信ジャンル
            </label>
            <input
              type="text"
              value={profile.genre}
              onChange={(e) => update({ genre: e.target.value })}
              placeholder="在宅ワーク・副業・AI活用..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              トーン
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.entries(TONE_LABELS) as [Tone, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update({ tone: value })}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      profile.tone === value
                        ? "bg-amber-100 border-amber-400 text-amber-900"
                        : "bg-background border-input text-muted-foreground hover:border-amber-300"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              ターゲット
            </label>
            <input
              type="text"
              value={profile.target}
              onChange={(e) => update({ target: e.target.value })}
              placeholder="働き方を変えたい人..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              NGワード（任意・カンマ区切り）
            </label>
            <input
              type="text"
              value={profile.ngWords.join(", ")}
              onChange={(e) =>
                update({
                  ngWords: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="稼ぐ, 簡単, 爆益..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              口癖・語尾（任意）
            </label>
            <input
              type="text"
              value={profile.speechStyle}
              onChange={(e) => update({ speechStyle: e.target.value })}
              placeholder="だよね、です。..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
