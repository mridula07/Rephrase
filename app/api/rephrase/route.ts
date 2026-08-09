import { NextResponse } from "next/server";
import { isGeminiFallbackEligible, rephraseMessage } from "@/lib/gemini";
import { rephraseWithGroq } from "@/lib/groq";
import { checkRateLimit, isPayloadTooLarge } from "@/lib/request-guards";
import {
  FORMALITY_LABELS,
  MAX_MESSAGE_LENGTH,
  SCENARIOS,
  type FormalityLabel,
  type Scenario,
} from "@/components/rephrase/translations";

function genericErrorResponse() {
  return NextResponse.json(
    { error: "We couldn't generate a rewrite right now. Please try again." },
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

  const { message, scenario, formality } = body as Record<string, unknown>;

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `Message is too long. Please limit it to ${MAX_MESSAGE_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (
    typeof scenario !== "string" ||
    !SCENARIOS.includes(scenario as Scenario)
  ) {
    return NextResponse.json(
      { error: "Invalid scenario." },
      { status: 400 }
    );
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
    message: message.trim(),
    scenario: scenario as Scenario,
    formality: formality as FormalityLabel,
  };

  try {
    const text = await rephraseMessage(input);
    if (process.env.NODE_ENV !== "production") {
      console.log("[Rephrase] Provider: Gemini");
    }
    return NextResponse.json({ text });
  } catch (geminiError) {
    console.error("Gemini rephrase failed:", geminiError);

    if (!isGeminiFallbackEligible(geminiError)) {
      return genericErrorResponse();
    }

    try {
      const text = await rephraseWithGroq(input);
      if (process.env.NODE_ENV !== "production") {
        console.log("[Rephrase] Gemini unavailable → Provider: Groq");
      }
      return NextResponse.json({ text });
    } catch (groqError) {
      console.error("Groq rephrase failed:", groqError);
      return genericErrorResponse();
    }
  }
}
