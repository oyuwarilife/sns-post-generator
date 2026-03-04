"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        copied
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 hover:border-amber-300"
      }`}
    >
      {copied ? "コピー済み" : "コピー"}
    </button>
  );
}
