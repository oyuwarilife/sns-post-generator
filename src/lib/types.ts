export type Platform = "x" | "threads" | "note";

export type Provider = "gemini" | "anthropic" | "openai";

export const PROVIDER_OPTIONS: {
  value: Provider;
  label: string;
  placeholder: string;
  model: string;
}[] = [
  { value: "gemini", label: "Gemini", placeholder: "AIza...", model: "Gemini 2.0 Flash" },
  { value: "anthropic", label: "Claude", placeholder: "sk-ant-...", model: "Claude Sonnet 4" },
  { value: "openai", label: "OpenAI", placeholder: "sk-...", model: "GPT-4o mini" },
];

export interface PlatformResult {
  content: string;
  title?: string; // note only
  pattern: string;
  axis: string;
  score: number;
  charCount: number;
  role: string;
}

export interface GenerateRequest {
  topic: string;
  apiKey: string;
  provider: Provider;
  tone?: string;
  targetEmotion?: string;
  postPattern?: string;
}

export interface GenerateResponse {
  x: PlatformResult;
  threads: PlatformResult;
  note: PlatformResult;
}

export interface ImageResult {
  imageDataUrl: string; // data:image/png;base64,...
  prompt: string;
  platform: Platform;
}

export const PLATFORM_ASPECT: Record<Platform, { label: string; suffix: string }> = {
  x: { label: "16:9", suffix: "wide landscape 16:9 aspect ratio" },
  threads: { label: "1:1", suffix: "square 1:1 aspect ratio" },
  note: { label: "16:9", suffix: "wide landscape 16:9 aspect ratio" },
};

export const IMAGE_MODEL = "gemini-2.5-flash-image";

export const TONE_OPTIONS = [
  { value: "default", label: "等身大・共感（デフォルト）" },
  { value: "honesty", label: "本音・ぶっちゃけ" },
  { value: "reflection", label: "振り返り・内省" },
  { value: "warmth", label: "温かい日常" },
] as const;

export const TARGET_EMOTION_OPTIONS = [
  { value: "auto", label: "自動判定" },
  { value: "anxiety", label: "不安・孤独・自責" },
  { value: "freedom", label: "自由への憧れ" },
  { value: "curiosity", label: "興味あるけど不安" },
  { value: "guilt", label: "両立の罪悪感" },
  { value: "selfcare", label: "自分の楽しみへの罪悪感" },
] as const;

export const POST_PATTERN_OPTIONS = [
  { value: "auto", label: "自動判定" },
  { value: "empathy", label: "共感型（あるある・エモ）" },
  { value: "typeA", label: "型A（判断基準）" },
  { value: "typeB", label: "型B（思考プロセス）" },
  { value: "typeC", label: "型C（Before→After）" },
  { value: "typeD", label: "型D（失敗→学び）" },
  { value: "typeE", label: "型E（ストーリー）" },
  { value: "typeF", label: "型F（問題提起→再定義）" },
  { value: "typeG", label: "型G（温かい日常）" },
] as const;
