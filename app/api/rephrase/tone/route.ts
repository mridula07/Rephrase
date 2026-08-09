import { NextResponse } from "next/server";
import { isGeminiFallbackEligible, refineTone } from "@/lib/gemini";
import { refineToneWithGroq } from "@/lib/groq";
import { checkRateLimit, isPayloadTooLarge } from "@/lib/request-guards";
import {
  FORMALITY_LABELS,
  MAX_MESSAGE_LENGTH,
  TONE_IDS,
  type FormalityLabel,
  type ToneId,
} from "@/components/rephrase/translations";

function genericErrorResponse() {
  return NextResponse.json(
    { error: "We couldn't adjust the tone right now. Please try again." },
    { status: 502 }
  );
}

export async function POST(request: Request) {
  if (isPayloadTooLarge(request)) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 }
    );
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(request);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: retryAfterSeconds
          ? { "Retry-After": String(retryAfterSeconds) }
          : undefined,
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { text, tone, formality } = body as Record<string, unknown>;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Text is required." },
      { status: 400 }
    );
  }

  if (text.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `Text is too long. Please limit it to ${MAX_MESSAGE_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (typeof tone !== "string" || !TONE_IDS.includes(tone as ToneId)) {
    return NextResponse.json({ error: "Invalid tone." }, { status: 400 });
  }

  if (
    typeof formality !== "string" ||
    !FORMALITY_LABELS.includes(formality as FormalityLabel)
  ) {
    return NextResponse.json(
      { error: "Invalid formality level." },
      { status: 400 }
    );
  }

  const input = {
    text: text.trim(),
    tone: tone as ToneId,
    formality: formality as FormalityLabel,
  };

  try {
    const refined = await refineTone(input);
    if (process.env.NODE_ENV !== "production") {
      console.log("[Rephrase] Tone provider: Gemini");
    }
    return NextResponse.json({ text: refined });
  } catch (geminiError) {
    console.error("Gemini tone refinement failed:", geminiError);

    if (!isGeminiFallbackEligible(geminiError)) {
      return genericErrorResponse();
    }

    try {
      const refined = await refineToneWithGroq(input);
      if (process.env.NODE_ENV !== "production") {
        console.log("[Rephrase] Tone unavailable on Gemini → Provider: Groq");
      }
      return NextResponse.json({ text: refined });
    } catch (groqError) {
      console.error("Groq tone refinement failed:", groqError);
      return genericErrorResponse();
    }
  }
}
