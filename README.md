# Interactive EdTech Learning Platform

DataCamp-style learning platform: Next.js App Router + TypeScript + PostgreSQL + Prisma + Better Auth.

## Limitation note (Stitch)
The Stitch project `17145875703644785116` and the four screen IDs could not be
retrieved: no Stitch MCP tools are available in this environment. The UI was
built fresh in the existing repo style; no Stitch URLs were fabricated.

## Setup
1. Copy `.env.example` to `.env`; set `DATABASE_URL`, `BETTER_AUTH_SECRET`.
2. Start PostgreSQL locally (the default URL expects `postgres/postgres` on
   `localhost:5432` with database `edtech`), e.g. `docker run --name edtech-pg
   -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=edtech -p 5432:5432 -d postgres:16`.
   Without a reachable database, `npx prisma migrate dev` fails with `P1001`
   (verified 2026-10-15: no server on `localhost:5432`), and DB-backed pages
   show a "temporarily unavailable" state instead of crashing.
3. `npm install`
4. `npx prisma migrate dev` (no `prisma/migrations` exist yet — this creates the initial migration)
5. `npm run db:seed`
6. `npm run dev`

First super-admin (after registering that user):
`npx tsx prisma/make-super-admin.ts you@example.com`

## Scripts
- `npm run test` — Vitest unit tests (6 files, 20 tests)
- `npm run test:e2e` — Playwright journeys (3 tests; needs `PLAYWRIGHT_BROWSERS_PATH=C:\playwright-browsers` on this machine)
- `npm run build` — production build
- `npm run db:seed` — categories, courses, lessons, quiz, exercise, achievements, missions, path, plans

## Learning lifecycle
Enroll → open lesson → pass quiz/exercise if required → complete →
idempotent XP (`XPTransaction.dedupeKey`) → course progress recalc →
streak update (UTC dates) → achievements → dashboard refresh.

## Security
Server-side auth + RBAC on every mutation; Zod validation; rate limits on
quiz/exercise/AI-tutor; no secret keys in client code; Stripe webhook returns
503 development-mode until configured.
