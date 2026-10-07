import { ApiError, GoogleGenAI } from "@google/genai";
import {
  buildRephraseUserContent,
  parseRephraseResult,
  REPHRASE_SYSTEM_INSTRUCTION,
  type RephraseInput,
} from "./rephrase-prompt";
import type { RephraseResult } from "./options";

// Free-tier Gemini Developer API model. Change here only.
const MODEL = "gemini-3.6-flash";

// Created on first use so a missing key doesn't break `next build`.
let client: GoogleGenAI | null = null;
const ai = () => (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    message: { type: "string" },
    why: { type: "string" },
  },
  required: ["message", "why"],
};

export async function rephraseMessage(
  input: RephraseInput
): Promise<RephraseResult> {
  const response = await ai().models.generateContent({
    model: MODEL,
    contents: buildRephraseUserContent(input),
    config: {
      systemInstruction: REPHRASE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseJsonSchema: RESULT_SCHEMA,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return parseRephraseResult(text);
}

// Only fall back to another provider for capacity/availability problems
// (rate limits, quota exhaustion, temporary server errors, network failures)
// — never for our own config/programming errors (bad key, bad request, etc.).
// A malformed JSON reply is also worth a second opinion from the fallback.
export function isGeminiFallbackEligible(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 429 || error.status >= 500;
  }
  if (error instanceof SyntaxError) return true;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("did not return json") ||
      message.includes("empty message") ||
      message.includes("fetch failed") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    );
  }
  return false;
}
