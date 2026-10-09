# Nuxt migration

## Objective
Replace the Phoenix backend (`backend/`) and the React SPA (`frontend/`) with one Nuxt (Node.js) app at the repo root, keeping the multi-user product, and replace the flat react-simple-maps map with a MapLibre globe styled like Rezi Map (map.rezi.ai).

## Problem / why
Two runtimes (Elixir + Vite) are overkill for a small multi-user "where I've been" map + timeline. One Nuxt app (Nitro server routes + Vue pages) covers it.

## Scope
- Nuxt 4 app at repo root (npm, matching the existing `frontend/package-lock.json`).
- DB: SQLite through libSQL (`@libsql/client`) + Drizzle ORM. Local file in dev (`DATABASE_URL=file:./data/cherry.db`); Turso URL + `DATABASE_AUTH_TOKEN` in prod.
- Same data model: users, eras, moments, countries (static reference, seeded).
- Auth: email + password, bcryptjs (reuse existing bcrypt hashes), sealed cookie session via `nuxt-auth-utils`.
- API parity with `backend/lib/andrews_timeline_web/router.ex` JSON routes (session, users, profile by slug, explore, countries, me, eras CRUD, moments CRUD).
- Pages parity with `frontend/src/lib/router.tsx`: `/` explore, `/login`, `/me`, `/u/[slug]`.
- Globe: `maplibre-gl` with `projection: globe`, OpenFreeMap positron basemap (no key), Natural Earth 110m countries GeoJSON filled by visit count, Rezi-style 3-layer glow circles for moments.
- One-shot import script from `backend/andrews_timeline_dev.db` into the new DB.

## Out of scope
- Deleting `backend/` and `frontend/` (ask the user at close; `backend/` holds the only copy of real data).
- Photos/uploads, magic-link login, email, deploy.

## Constraints
- Never commit to `main`. Conventional Commits, no AI attribution.
- Do not delete or write to `backend/andrews_timeline_dev.db` (read-only source).
- TDD: enabled (session config "Strict TDD Mode: enabled"); runner: Vitest (`npm test`). RED → GREEN → REFACTOR for server logic.

## Tasks
- [x] T1 Scaffold Nuxt 4 + Tailwind v4 + Vitest at root; fix `.gitignore`. Route: delegated (writer, 2+ files).
- [x] T2 DB layer: Drizzle schema, migrations, countries seed, import script from the Phoenix DB. Route: delegated.
- [x] T3 Server API + auth with tests. Route: delegated.
- [ ] T4 Vue pages + components (explore, login, me, profile, timeline, add-moment modal). Route: delegated.
- [ ] T5 MapLibre globe component (Rezi look). Route: delegated.
- [ ] T6 README rewrite for the Nuxt app. Route: delegated with T5.

## Acceptance criteria
- `npm run build`, `npm test`, `npx nuxi typecheck` pass.
- Dev login with an imported user works; existing moments show on the globe and timeline.
- Private moments never appear in public endpoints.

## Progress / evidence
(commit SHAs and check results per task)
- T1 (316fe1e): `npm run build`: ok; `npx nuxi typecheck`: ok (no errors); `npm test`: no tests yet (Vitest 5 runs, exits 1 on empty suite; tests land in T2/T3). Stack: nuxt 4.6, tailwind 4.3 via @tailwindcss/vite, nuxt-auth-utils 0.5, typescript 5.9 (7.x not used: Nuxt/vue-tsc toolchain targets 5.x). `data/.gitkeep` keeps the DB dir.
- T2 (e1ed289): TDD RED observed (tests/db.test.ts failed: `../server/db/seed` / `scripts/import-phoenix` modules missing), then GREEN: `npm test`: 3 passed (seed idempotent, import preserves ids/hash, import refuses non-empty target). `npx nuxi typecheck`: ok. Local `data/cherry.db` (gitignored) via `db:migrate` + `db:import` + `db:seed`: users 2, eras 5, moments 11, countries 64. Timestamps are ISO text (`inserted_at`/`updated_at`) like Phoenix; `moments.date` is text YYYY-MM-DD.
- T3 (b986f95): TDD RED observed (tests/api.test.ts failed: `../server/utils/accounts` missing), then GREEN after implementation (one extra RED->GREEN fix: Drizzle wraps UNIQUE errors, so `isUniqueViolation` walks the `cause` chain). `npm test`: 2 files, 16 tests passed. `npx nuxi typecheck`: ok. `npm run build`: ok. Smoke (built server, port 3399, imported DB): `GET /api/countries` 200 (64 countries); `GET /api/explore` 200 (andrew 4 countries/8 moments, second user 1/1); `GET /api/users/andrew` 200 (eras with public moments); `GET /api/me` without cookie 401; `POST /api/session` andrew@cherry.local/cherry-was-here 200 + cookie, wrong password 401 `{error}`; `GET /api/me` with cookie 200; `GET /api/moments` 200; invalid `POST /api/moments` 422 `{errors}`; `PATCH /api/moments/99999` 404. Deviations from Phoenix JSON: login/register no longer return `token` (cookie session), responses are `{ user }`; 401 from missing session uses Nitro's standard error body. Extras: moment `era_id` must be the user's own era and `country_code` must exist (422).

## Next step
T4.
