"use client";

export function PostBothButton({
  xText,
  threadsText,
}: {
  xText: string;
  threadsText: string;
}) {
  const handlePostBoth = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
    window.open(threadsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handlePostBoth}
      className="w-full py-3 px-6 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 shadow-md shadow-amber-300/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-300/40"
    >
      両方に同時投稿
    </button>
  );
}
