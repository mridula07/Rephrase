// Shared by the UI and the API so the two can never drift apart.

export const MAX_MESSAGE_LENGTH = 1000;

export const SCENARIOS = [
  "Unrealistic deadline",
  "Saying no to extra work",
  "Asking for a raise",
  "Following up",
  "Giving feedback",
  "Disagreeing with a decision",
  "Asking for help",
  "Asking for clarification",
  "Requesting time off",
  "Addressing a mistake",
] as const;
export type Scenario = (typeof SCENARIOS)[number];

// The first four are shown as pills; the rest live under "More".
export const PRIMARY_SCENARIOS: Scenario[] = SCENARIOS.slice(0, 4) as Scenario[];
export const MORE_SCENARIOS: Scenario[] = SCENARIOS.slice(4) as Scenario[];

export const RECIPIENTS = ["Manager", "Peer", "Senior", "Client"] as const;
export type Recipient = (typeof RECIPIENTS)[number];

export const FIRMNESS = ["Gentle", "Balanced", "Firm"] as const;
export type Firmness = (typeof FIRMNESS)[number];

export interface RephraseRequest {
  message: string;
  scenario: Scenario | null;
  to: Recipient;
  firmness: Firmness;
}

export interface RephraseResult {
  message: string;
  why: string;
}
