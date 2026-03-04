"use client";

interface PostToThreadsButtonProps {
  text: string;
  disabled?: boolean;
}

const MAX_URL_LENGTH = 2000;
const BASE_URL = "https://www.threads.net/intent/post?text=";

export function PostToThreadsButton({ text, disabled }: PostToThreadsButtonProps) {
  const handlePost = async () => {
    const encoded = encodeURIComponent(text);

    if ((BASE_URL + encoded).length > MAX_URL_LENGTH) {
      await navigator.clipboard.writeText(text);
      window.open("https://www.threads.net", "_blank", "noopener,noreferrer");
    } else {
      window.open(`${BASE_URL}${encoded}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePost}
      disabled={disabled || !text}
      title="Threadsの投稿画面を開きます"
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 192 192" fill="currentColor">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.326-38.093 34.691.528 9.818 5.235 18.262 13.261 23.764 6.784 4.652 15.502 6.972 24.558 6.534 11.927-.576 21.263-5.103 27.727-13.437 4.916-6.334 8.015-14.46 9.384-24.665 5.636 3.404 9.835 7.903 12.294 13.293 4.181 9.166 4.426 24.229-3.612 32.268-8.86 8.86-19.523 12.691-35.591 12.812-17.812-.134-31.283-5.851-40.055-16.995-8.158-10.363-12.381-25.211-12.546-44.104.165-18.893 4.388-33.741 12.546-44.104 8.772-11.144 22.243-16.861 40.055-16.995 17.944.137 31.617 5.9 40.638 17.12 4.378 5.444 7.68 12.292 9.874 20.37l14.677-3.914c-2.659-9.94-6.922-18.553-12.752-25.666C145.726 14.112 129.05 7.059 108.073 6.9h-.108c-20.895.159-37.457 7.259-49.217 21.108C49.032 39.423 44.1 56.677 43.905 77.89l-.003.16.003.16c.195 21.213 5.127 38.467 14.84 49.922 11.76 13.849 28.322 20.949 49.217 21.108h.108c19.853-.135 33.576-5.398 44.58-17.094 12.768-13.568 12.262-34.783 6.038-48.462-4.46-9.808-12.752-17.605-24.071-22.696zM99.87 141.39c-9.988.479-20.394-3.937-21.094-16.96-.52-9.674 6.876-20.444 25.138-21.494 2.205-.127 4.36-.186 6.468-.186 6.216 0 12.032.595 17.325 1.748-1.972 28.267-18.032 36.418-27.837 36.892z" />
      </svg>
      Threadsに投稿
    </button>
  );
}
