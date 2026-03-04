import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateContent(
  apiKey: string,
  system: string,
  userMessage: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: system,
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}

export async function* streamContent(
  apiKey: string,
  system: string,
  userMessage: string
): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: system,
  });

  const result = await model.generateContentStream(userMessage);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
