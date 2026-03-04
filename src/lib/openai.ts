import OpenAI from "openai";

export async function generateContent(
  apiKey: string,
  system: string,
  userMessage: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function* streamContent(
  apiKey: string,
  system: string,
  userMessage: string
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey });

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}
