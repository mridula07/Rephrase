import Groq from "groq-sdk";
import {
  buildRephraseUserContent,
  parseRephraseResult,
  REPHRASE_SYSTEM_INSTRUCTION,
  type RephraseInput,
} from "./rephrase-prompt";
import type { RephraseResult } from "./options";

// Fallback provider model. Change here only.
const MODEL = "openai/gpt-oss-120b";

// Created on first use so a missing key doesn't break `next build`.
let client: Groq | null = null;
const groq = () => (client ??= new Groq({ apiKey: process.env.GROQ_API_KEY }));

export async function rephraseWithGroq(
  input: RephraseInput
): Promise<RephraseResult> {
  const completion = await groq().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: REPHRASE_SYSTEM_INSTRUCTION },
      { role: "user", content: buildRephraseUserContent(input) },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response");
  }
  return parseRephraseResult(text);
}
