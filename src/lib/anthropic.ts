import Anthropic from "@anthropic-ai/sdk";

export async function generateContent(
  apiKey: string,
  system: string,
  userMessage: string
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

export async function* streamContent(
  apiKey: string,
  system: string,
  userMessage: string
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
