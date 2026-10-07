import { NextResponse } from "next/server";
import { isGeminiFallbackEligible, rephraseMessage } from "@/lib/gemini";
import { rephraseWithGroq } from "@/lib/groq";
import { checkRateLimit, isPayloadTooLarge } from "@/lib/request-guards";
import {
  FIRMNESS,
  MAX_MESSAGE_LENGTH,
  RECIPIENTS,
  SCENARIOS,
  type Firmness,
  type Recipient,
  type Scenario,
} from "@/lib/options";

function genericErrorResponse() {
  return NextResponse.json(
    { error: "Couldn't write that one. Try again in a moment." },
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

  const { message, scenario, to, firmness } = body as Record<string, unknown>;

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Write something first." },
      { status: 400 }
    );
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `That's a bit long. Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  // Scenario is optional: null/undefined means "work it out from the message".
  if (
    scenario != null &&
    (typeof scenario !== "string" || !SCENARIOS.includes(scenario as Scenario))
  ) {
    return NextResponse.json({ error: "Invalid scenario." }, { status: 400 });
  }

  if (typeof to !== "string" || !RECIPIENTS.includes(to as Recipient)) {
    return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
  }

  if (
    typeof firmness !== "string" ||
    !FIRMNESS.includes(firmness as Firmness)
  ) {
    return NextResponse.json({ error: "Invalid firmness." }, { status: 400 });
  }

  const input = {
    message: message.trim(),
    scenario: (scenario ?? null) as Scenario | null,
    to: to as Recipient,
    firmness: firmness as Firmness,
  };

  try {
    const result = await rephraseMessage(input);
    if (process.env.NODE_ENV !== "production") {
      console.log("[Rephrase] Provider: Gemini");
    }
    return NextResponse.json(result);
  } catch (geminiError) {
    console.error("Gemini rephrase failed:", geminiError);

    if (!isGeminiFallbackEligible(geminiError)) {
      return genericErrorResponse();
    }

    try {
      const result = await rephraseWithGroq(input);
      if (process.env.NODE_ENV !== "production") {
        console.log("[Rephrase] Gemini unavailable → Provider: Groq");
      }
      return NextResponse.json(result);
    } catch (groqError) {
      console.error("Groq rephrase failed:", groqError);
      return genericErrorResponse();
    }
  }
}
