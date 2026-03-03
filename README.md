# CS Advisor — AI Customer Support Chatbot

An AI-powered customer support advisor built on the Vercel platform stack. Ask it anything about running a great support organization: escalation design, knowledge base architecture, AI deflection strategy, CSAT optimization, and more. The app itself is a working example of the AI-powered support tooling it advises on.

**Live demo:** [cs-chatbot-theta.vercel.app](https://cs-chatbot-theta.vercel.app)

---

## Features

- **Multi-model AI** — 10 models across 4 providers (Anthropic, OpenAI, Google, xAI), including reasoning models (Claude 3.7 Sonnet extended thinking, Grok Code chain-of-thought). Switch models mid-conversation.
- **Streaming responses** — word-level streaming via Vercel AI SDK `streamText` + `smoothStream`. Resumable streams via Redis so dropped connections don't lose the response.
- **Document artifacts** — AI generates code, text documents, and spreadsheets directly in the UI. Python code artifacts execute in-browser via Pyodide.
- **Tool calling with human-in-the-loop approval** — AI proposes actions (weather lookup, document creation), user confirms before execution.
- **File uploads** — multimodal input backed by Vercel Blob with automatic CDN delivery.
- **Auth + rate limiting** — NextAuth 5 with guest (20 msg/day) and registered (50 msg/day) tiers. Rate limits tracked in Postgres — no external service needed.
- **Server-side caching** — `unstable_cache` on chat metadata with tag-based `revalidateTag` invalidation on every mutation.
- **Full Vercel platform stack** — AI Gateway, OpenTelemetry, Analytics, Speed Insights, Blob, geolocation via Vercel Functions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router, React 19 |
| AI | Vercel AI SDK v4, AI Gateway |
| Database | Postgres (Drizzle ORM) |
| Auth | NextAuth 5 |
| Storage | Vercel Blob |
| Cache | Next.js Data Cache (`unstable_cache`) + Redis (optional) |
| Observability | `@vercel/otel` (OpenTelemetry) |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |

---

## Vercel Platform Features

| Feature | What it does in this app |
|---|---|
| **AI Gateway** | Routes all 10 models through a single API key with unified rate limiting and usage observability |
| **OpenTelemetry** | Zero-config AI call tracing — tokens, latency, finish reason — via `instrumentation.ts` and `experimental_telemetry` |
| **Analytics** | Page view tracking with no configuration beyond a component import |
| **Speed Insights** | Real-user Core Web Vitals (LCP, FID, CLS) from the browser |
| **Vercel Blob** | File storage with implicit CDN — no S3, no CloudFront, no IAM |
| **Geolocation** | User city/country injected into the AI system prompt at runtime via `geolocation(request)` |
| **`maxDuration = 60`** | Extends the Function timeout to support long streaming AI responses |
| **`next/after`** | Registers resumable stream context after response headers are sent, keeping it off the critical path |

---

## Rendering Strategy

- **Server Components** — auth checks, DB queries, session reads, initial message history. Data is in the HTML on first load.
- **Client Components** — streaming AI responses, real-time state, user input.
- **Two-level Suspense** — cookies and auth are resolved in separate async boundaries so auth latency doesn't block the page shell. See `app/(chat)/layout.tsx`.
- **Data cache** — `getChatById` is cached at the data layer (not the page layer) because every route is auth-gated. ISR isn't applicable here; `unstable_cache` with `revalidateTag` is the correct equivalent for authenticated content.

---

## Model Providers

All models are accessed through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) — one API key, unified rate limiting, automatic usage observability across every provider.

| Provider | Models |
|---|---|
| Google | Gemini 2.5 Flash Lite (default), Gemini 2.5 Pro |
| Anthropic | Claude 3.5 Sonnet, Claude 3.7 Sonnet, Claude 3.7 Sonnet (extended thinking) |
| OpenAI | GPT-4o, GPT-4o Mini, o4-mini |
| xAI | Grok 3, Grok 3 Mini, Grok Code (chain-of-thought) |

**For Vercel deployments:** AI Gateway authentication is handled automatically via OIDC — no API key needed.

**For non-Vercel deployments:** Set `AI_GATEWAY_API_KEY` in `.env.local`.

---

## Running Locally

You will need the environment variables defined in [`.env.example`](.env.example). The recommended approach pulls them directly from your Vercel project:

```bash
npm i -g vercel
vercel link
vercel env pull
```

Then:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

App runs on [localhost:3000](http://localhost:3000).

**Redis is optional.** Without it, streams work but aren't resumable on connection drop.

> Never commit `.env` — it exposes keys for all connected services.
