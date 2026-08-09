import Groq from "groq-sdk";
import {
  buildRephraseUserContent,
  buildToneUserContent,
  REPHRASE_SYSTEM_INSTRUCTION,
  REPHRASE_TONE_SYSTEM_INSTRUCTION,
  type RephraseInput,
  type ToneRefineInput,
} from "./rephrase-prompt";

// Fallback provider model. Change here only.
const MODEL = "openai/gpt-oss-120b";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function rephraseWithGroq({
  message,
  scenario,
  formality,
}: RephraseInput): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: REPHRASE_SYSTEM_INSTRUCTION },
      {
        role: "user",
        content: buildRephraseUserContent({ message, scenario, formality }),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response");
  }
  return text;
}

export async function refineToneWithGroq({
  text,
  tone,
  formality,
}: ToneRefineInput): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: REPHRASE_TONE_SYSTEM_INSTRUCTION },
      {
        role: "user",
        content: buildToneUserContent({ text, tone, formality }),
      },
    ],
  });

  const refined = completion.choices[0]?.message?.content?.trim();
  if (!refined) {
    throw new Error("Groq returned an empty response");
  }
  return refined;
}
