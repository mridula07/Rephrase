// Runs a few raw messages through every Recipient × Firmness combination so
// you can compare the rewrites side by side.
//
//   npm run eval            → 3 messages × 12 combinations (≈ 3 minutes)
//   npm run eval -- 1       → just the first message
//
// Results are written to eval-results.md (not committed).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { rephraseMessage } from "../lib/gemini";
import { FIRMNESS, RECIPIENTS, type Scenario } from "../lib/options";

const CASES: { message: string; scenario: Scenario | null }[] = [
  {
    message:
      "this deadline is impossible. we're all burnt out and nobody asked us before committing to friday",
    scenario: "Unrealistic deadline",
  },
  {
    message:
      "i already have 3 things due this week, i can't take the dashboard thing too. why is it always me",
    scenario: "Saying no to extra work",
  },
  {
    message:
      "sent the report on monday, still haven't heard back. need it signed off before thursday or we miss the launch",
    scenario: "Following up",
  },
];

// Gemini's free tier allows ~10 requests a minute.
const DELAY_MS = 6500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const cell = (t: string) => t.replace(/\|/g, "\\|").replace(/\n+/g, "<br>");

// Load keys from .env.local (works on any Node version).
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. Add it to .env.local first.");
    process.exit(1);
  }
  const limit = Number(process.argv[2]) || CASES.length;
  const cases = CASES.slice(0, limit);
  const total = cases.length * RECIPIENTS.length * FIRMNESS.length;
  let done = 0;
  let out = `# Rephrase eval\n\n_${new Date().toLocaleString()}_\n`;

  for (const c of cases) {
    out += `\n## "${c.message}"\nSituation: ${c.scenario ?? "none"}\n\n`;
    out += `| To \\ Firmness | ${FIRMNESS.join(" | ")} |\n|---|${FIRMNESS.map(() => "---").join("|")}|\n`;
    for (const to of RECIPIENTS) {
      const row: string[] = [];
      for (const firmness of FIRMNESS) {
        done++;
        process.stdout.write(`\r${done}/${total}  ${to} · ${firmness}          `);
        try {
          const r = await rephraseMessage({ message: c.message, scenario: c.scenario, to, firmness });
          row.push(`${cell(r.message)}<br><br>_${words(r.message)} words · ${cell(r.why)}_`);
        } catch (e) {
          row.push(`**Error:** ${cell(e instanceof Error ? e.message : String(e))}`);
        }
        await sleep(DELAY_MS);
      }
      out += `| **${to}** | ${row.join(" | ")} |\n`;
    }
  }

  writeFileSync("eval-results.md", out);
  console.log("\nDone → eval-results.md");
}

main();
