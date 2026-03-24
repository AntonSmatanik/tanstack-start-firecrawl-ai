# tanstack-tutorial

Full-stack web app built with TanStack Start (React 19) on Nitro/Vite, featuring authenticated URL bookmarking with web scraping via Firecrawl and AI-powered content processing.

## Stack

| Layer      | Technology                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | TanStack Start (file-based routing, SSR, server functions)                                                                                                           |
| Runtime    | Nitro (server engine) + Vite 7 (dev/build)                                                                                                                           |
| UI         | React 19, Tailwind CSS 4, shadcn/ui (base-nova style, Base UI primitives)                                                                                            |
| Auth       | better-auth (email/password, session-based, Prisma adapter)                                                                                                          |
| Database   | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)                                                                                                                       |
| Scraping   | Firecrawl (scrape, map, bulk scrape with structured JSON extraction)                                                                                                 |
| AI         | Vercel AI SDK v6 (`streamText`, `generateText`, `useCompletion`) via OpenRouter (`nvidia/nemotron-3-nano-30b-a3b:free`), streamed markdown rendering with Streamdown |
| Validation | Zod (route search params, form schemas, server fn inputs)                                                                                                            |

## Project Structure

```
src/
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx       # Root layout (theme, devtools, toaster)
│   ├── index.tsx        # Landing page
│   ├── _auth/           # Auth layout group (login, signup)
│   ├── api/auth/$.ts    # Auth API catch-all (better-auth handler)
│   └── dashboard/       # Authenticated dashboard
│       ├── route.tsx    # Dashboard layout (sidebar)
│       ├── items/       # Saved items CRUD
│       ├── import/      # URL import (single + bulk)
│       └── discover/    # Discovery page
├── components/          # Shared components
│   ├── ui/              # shadcn/ui primitives
│   └── web/             # Navbar, theme toggle
├── data/                # Server functions (createServerFn)
├── schemas/             # Zod schemas
├── middlewares/          # Auth middleware (request + server fn)
├── generated/prisma/    # Prisma generated client
└── lib/                 # Auth, DB, utils, Firecrawl client
```

## Setup

```bash
pnpm install
cp .env.local.example .env.local  # configure env vars
```

### Environment Variables

```
DATABASE_URL=postgresql://...
FIRECRAWL_API_KEY=...
BETTER_AUTH_SECRET=...
AI_API_KEY=...              # OpenRouter API key
```

### Database

```bash
pnpm db:generate    # generate Prisma client
pnpm db:push        # push schema to DB (dev)
pnpm db:migrate     # run migrations
pnpm db:seed        # seed data
pnpm db:studio      # open Prisma Studio
```

All DB commands load env from `.env.local` via `dotenv-cli`.

## Development

```bash
pnpm dev            # start dev server on :3000
```

## Build & Preview

```bash
pnpm build
pnpm preview
```

## AI Architecture

- **Provider**: OpenRouter (`@openrouter/ai-sdk-provider`) → model: `nvidia/nemotron-3-nano-30b-a3b:free`
- **Server streaming**: `POST /api/ai/summary` — uses `streamText()` to stream content summaries back to the client via `toTextStreamResponse()`
- **Server generation**: `saveSummaryAndGenerateTagsFn` — uses `generateText()` to extract 3–5 tags from a summary, parses comma-separated output, stores in DB
- **Client hook**: `useCompletion()` from `@ai-sdk/react` with `streamProtocol: 'text'` — drives the summary UI with real-time streaming, triggers tag generation via `onFinish`
- **Markdown rendering**: Streamdown with plugins (`@streamdown/code`, `@streamdown/math`, `@streamdown/cjk`, `@streamdown/mermaid`) for rendering streamed AI output

## Key Patterns

- **Server functions** (`createServerFn`) with middleware for auth-gated data access
- **Request middleware** chain: logging → auth (session injection via `getWebRequest`)
- **Suspense boundaries** with skeleton fallbacks for async data loading
- **Search param validation** via `zodValidator` on route definitions
- **Debounced search** with `useEffect` + `setTimeout` syncing input state to URL params
- **Global Prisma singleton** in dev to survive HMR (attached to `globalThis`)
- **Theme persistence** via inline `<script>` in root shell to prevent FOUC
- **Path aliases**: `#/*` and `@/*` both resolve to `./src/*`
