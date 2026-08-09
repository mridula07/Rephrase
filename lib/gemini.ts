import { ApiError, GoogleGenAI } from "@google/genai";
import {
  buildRephraseUserContent,
  buildToneUserContent,
  REPHRASE_SYSTEM_INSTRUCTION,
  REPHRASE_TONE_SYSTEM_INSTRUCTION,
  type RephraseInput,
  type ToneRefineInput,
} from "./rephrase-prompt";

// Free-tier Gemini Developer API model. Change here only.
const MODEL = "gemini-3.6-flash";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function rephraseMessage({
  message,
  scenario,
  formality,
}: RephraseInput): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildRephraseUserContent({ message, scenario, formality }),
    config: {
      systemInstruction: REPHRASE_SYSTEM_INSTRUCTION,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}

export async function refineTone({
  text,
  tone,
  formality,
}: ToneRefineInput): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildToneUserContent({ text, tone, formality }),
    config: {
      systemInstruction: REPHRASE_TONE_SYSTEM_INSTRUCTION,
    },
  });

  const refined = response.text?.trim();
  if (!refined) {
    throw new Error("Gemini returned an empty response");
  }
  return refined;
}

// Only fall back to another provider for capacity/availability problems
// (rate limits, quota exhaustion, temporary server errors, network failures)
// — never for our own config/programming errors (bad key, bad request, etc.).
export function isGeminiFallbackEligible(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 429 || error.status >= 500;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
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
