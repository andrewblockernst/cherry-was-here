# Eras CRUD and colors

## Objective
Let users fully manage their eras from the UI and choose colors per era and per moment, with the globe painting places and moments in those colors.

## Problem
- Eras can only be listed in the UI; there is no create, edit, delete or reorder.
- Era `color` has no validation; moments have no color at all.
- The globe paints every visited country and point with one constant accent color.

## Scope
- API: `moments.color` column (migration 0001), hex color validation on eras and moments, era slug auto-generated from title when omitted, `order_index` auto-assigned, `end_year >= start_year`.
- Globe: effective color = moment color, else era color, else accent. Points use it per feature; countries use the color of their most recent moment.
- UI: era editor (create, edit, delete, move up/down) with color picker and emoji; moment edit (not only create) with an optional color override that defaults to the era color.
- Out of scope: world view (`/`) keeps the accent color because it only has aggregated counts. Applying migration 0001 to Turso needs explicit approval.

## Constraints
- Strict TDD on (gentle-ai config), runner `npm test` (vitest). RED before GREEN for logic in `server/utils/timeline.ts` and `app/utils/globe.ts`.
- RDD: off (global). Delivery strategy: single-pr (project is vibecoding; user merges).
- Native `<input type="color">`, no new dependencies.

## Tasks
- [x] T1 Data + API: migration for `moments.color`, color/slug/order/year rules, tests. Route: delegated writer.
- [x] T2 Globe colors: effective color helper, colored points and country fill expression, tests. Route: delegated writer.
- [x] T3 Era editor UI in the "Tu vida" drawer. Route: delegated writer.
- [x] T4 Moment edit + color override in the modal and stamp. Route: delegated writer.
- [ ] T5 README update. Route: delegated writer.
- [x] T6 Brand label: plain "yafue", top-right aligned with the hamburger, no tagline. Route: inline (mechanical).

Route evidence: 4+ files to understand and 2+ non-trivial files to write, so mapping and writing are delegated.

## Acceptance criteria
- Create, edit, delete and reorder eras from "Tu vida" without touching the API by hand.
- Pick a color for an era; its moments and countries show that color on the globe.
- Override the color of a single moment; that point and (if most recent) its country use it.
- Invalid colors (not `#rrggbb`) are rejected by the API.
- `npm test` passes.

## Checks
`npm test`, `npx nuxi typecheck` if it runs cleanly.

## Progress
- T1: RED observed (5 failing: color validation x2, slug derive, order_index, end_year rule), then GREEN; `npm test` 48 passed. Migration 0001_living_white_tiger.sql. Commit: see git log (feat(eras): api rules).
- T1 commit: 8891a2e.
- T2: RED observed (5 failing: effectiveColor x2, countryColorExpression x2, feature props color), then GREEN; `npm test` 52 passed.
- T2 commit: 1a84ade.
- T6: brand moved top-right, tagline and em removed (done before T3 per request).
- T6 commit: 0c9d8a4.
- T3: EraEditor modal (create/edit/delete/reorder, color picker + swatches + live preview) from "Tu vida"; `npm test` 52 passed, `npx nuxi typecheck` clean.
- T3 commit: d99d02e.
- T4: moment edit mode + optional own color with inherited preview, stamp edit button; `npm test` 52 passed, `npx nuxi typecheck` clean.
