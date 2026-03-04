"use client";

interface PostToXButtonProps {
  text: string;
  disabled?: boolean;
}

const MAX_URL_LENGTH = 2000;
const BASE_URL = "https://twitter.com/intent/tweet?text=";

export function PostToXButton({ text, disabled }: PostToXButtonProps) {
  const handlePost = async () => {
    const encoded = encodeURIComponent(text);

    if ((BASE_URL + encoded).length > MAX_URL_LENGTH) {
      await navigator.clipboard.writeText(text);
      window.open("https://twitter.com/compose/tweet", "_blank", "noopener,noreferrer");
    } else {
      window.open(`${BASE_URL}${encoded}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePost}
      disabled={disabled || !text}
      title="Xの投稿画面を開きます"
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Xに投稿
    </button>
  );
}
