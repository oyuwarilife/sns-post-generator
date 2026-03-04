export type Platform = "x" | "threads";

export type Provider = "gemini" | "anthropic" | "openai";

export type Tone = "friendly" | "expert" | "casual" | "passionate";

export const TONE_LABELS: Record<Tone, string> = {
  friendly: "親しみ系",
  expert: "専門家系",
  casual: "カジュアル",
  passionate: "熱量系",
};

export interface UserProfile {
  name: string;
  genre: string;
  tone: Tone;
  target: string;
  ngWords: string[];
  speechStyle: string;
}

export const PRESETS: UserProfile[] = [
  {
    name: "🏠 在宅ワーカー",
    genre: "在宅ワーク・リモートワーク",
    tone: "friendly",
    target: "働き方を変えたい人",
    ngWords: [],
    speechStyle: "",
  },
  {
    name: "💻 エンジニア",
    genre: "技術・開発・プログラミング",
    tone: "expert",
    target: "同業エンジニア",
    ngWords: [],
    speechStyle: "",
  },
  {
    name: "📈 SNSマーケター",
    genre: "集客・マーケティング・SNS運用",
    tone: "passionate",
    target: "個人事業主・フリーランス",
    ngWords: [],
    speechStyle: "",
  },
  {
    name: "✨ クリエイター",
    genre: "創作・デザイン・クリエイティブ",
    tone: "casual",
    target: "クリエイティブ層",
    ngWords: [],
    speechStyle: "",
  },
  {
    name: "👶 子育てアカウント",
    genre: "子育て・家族・育児",
    tone: "friendly",
    target: "同じ境遇のパパママ",
    ngWords: [],
    speechStyle: "",
  },
];

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
  title?: string;
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
  profile: UserProfile;
}

export interface GenerateResponse {
  x: PlatformResult;
  threads: PlatformResult;
}
