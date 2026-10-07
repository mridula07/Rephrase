# Rephrase

Type it the way you'd say it to a friend. Rephrase turns it into something you can send at work, and tells you why it works.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Create a `.env.local` file in this folder with your keys (never commit it):

```
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key   # optional backup if Gemini is busy
```

## How it's built

- `app/api/rephrase/route.ts` — one endpoint. Takes `{ message, scenario?, to, firmness }`, returns `{ message, why }`. Gemini first, Groq as backup.
- `lib/rephrase-prompt.ts` — the system prompt and per-situation guidance.
- `lib/options.ts` — situations, recipients, firmness levels (shared by UI and API).
- `components/rephrase/` — the folder-on-a-desk UI. The desk is a 1440×900 scene scaled to fit the window; below 760px wide the two pages stack.

## Credits

- UI components, icons and the AI sparkle are adapted from the **Paper Wireframe Kit** by Method (Figma Community) — check the kit's licence and keep this credit.
- Fonts: Patrick Hand and IBM Plex Mono (SIL Open Font License).
- Desk photos in `public/desk/` are placeholders and must be replaced with licensed or self-shot images before launch.
