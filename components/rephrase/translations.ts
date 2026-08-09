export type Scenario =
  | "Asking for a raise"
  | "Setting expectations"
  | "Giving feedback"
  | "Requesting time off"
  | "Declining a request"
  | "Asking for clarification"
  | "Following up"
  | "Disagreeing with a decision"
  | "Asking for help"
  | "Addressing a mistake";

export const SCENARIOS: Scenario[] = [
  "Asking for a raise",
  "Setting expectations",
  "Giving feedback",
  "Requesting time off",
  "Declining a request",
  "Asking for clarification",
  "Following up",
  "Disagreeing with a decision",
  "Asking for help",
  "Addressing a mistake",
];

export const TONE_LABELS = [
  "More Direct",
  "Warmer",
  "More Concise",
  "Diplomatic",
] as const;

export type ToneLabel = (typeof TONE_LABELS)[number];

export const TONE_IDS = ["direct", "warmer", "confident", "concise"] as const;

export type ToneId = (typeof TONE_IDS)[number];

// Maps each visible tone pill to the AI-facing tone id. "Diplomatic" maps to
// "confident" (assured/self-possessed phrasing) rather than a literal
// diplomatic-softening behavior — see project decision on the 4th tone.
export const TONE_LABEL_TO_ID: Record<ToneLabel, ToneId> = {
  "More Direct": "direct",
  Warmer: "warmer",
  "More Concise": "concise",
  Diplomatic: "confident",
};

// Applies to both the raw message (/api/rephrase) and the in-progress
// translation being tone-adjusted (/api/rephrase/tone) — generous for a
// realistic workplace message while bounding AI provider cost per request.
export const MAX_MESSAGE_LENGTH = 2000;

export const FORMALITY_LABELS = [
  "Casual",
  "Polished",
  "Professional",
  "Formal",
] as const;

export type FormalityLabel = (typeof FORMALITY_LABELS)[number];

export function getFormalityLabel(step: number): FormalityLabel {
  return FORMALITY_LABELS[step] ?? "Professional";
}
