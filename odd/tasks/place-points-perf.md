# Place points and faster load

## Objective
Let a moment be pinned to a province/state/county/city as a colored point (countries keep their full fill), and make the atlas appear faster.

## Problem / why
- Moments already store `latitude`/`longitude` and render as points (`app/utils/globe.ts:13`), but the UI has no way to set them.
- The globe loads serially: geojson, then style, then map (`WorldGlobe.client.vue:177`); long intro (3.8 s ease); drawer data only fetched after hydration with no loading state; static data has no cache headers.

## Scope
- In: place search in the moment modal (Photon geocoder, no key), saving lat/lng + location name; perf fixes listed below.
- Out: admin-1/admin-2 polygons (user chose points only), optimistic updates, self-hosted tiles.

## Constraints
- UI copy in Spanish (existing app copy), code/comments in English. No new dependencies.
- No DB migrations needed (columns exist). Never touch `.env`.
- TDD: on (session Strict TDD Mode), runner `npm test` (vitest). Also `npx nuxi typecheck`.

## Tasks
- [x] T1 Place search: debounced Photon lookup in AddMomentModal, filtered to the selected country when set; choosing a result fills location + lat/lng; clear option; payload sends latitude/longitude; server validation accepts them. Pure helper (Photon feature -> {label, lat, lng, countryCode}) unit-tested.
- [x] T2 Faster load: fetch geojson and style in parallel; shorten intro camera ease and UI delays; routeRules cache headers for `/geo/**` and `/api/countries`; loading skeleton/state in the drawer for `me`; parallel fetches in `me.vue`.

## Acceptance
- A moment with a chosen place shows its colored point at that place; country fill unchanged.
- Globe appears noticeably sooner; tests and typecheck pass.

## Routes
- T1, T2: delegated direct (writer trigger: 2+ non-trivial files).

## Progress / evidence
- Branch `feature/place-points-perf` (stacked on `fix/stamp-action-buttons`).
- T1 commit fa092f6: Photon place search (`app/utils/geocode.ts`, `AddMomentModal.vue`), lat/lng payload; server already validated lat/lng (test added). RED: `tests/geocode.test.ts` failed (module missing) -> GREEN 5/5. Photon rejects `lang=es` (HTTP 400), so `lang=default` is used. Checks: npm test 61 passed, nuxi typecheck exit 0.
- T2 commit 2ed748c: parallel geojson+style fetch, intro ease 3800->1500 ms, shell delays <=0.15 s (stagger base 60 ms), routeRules cache for `/geo/**` and `/api/countries`, drawer skeleton for `me`, parallel fetches in `me.vue`. Checks: npm test 61 passed, nuxi typecheck exit 0, npm run build complete.
