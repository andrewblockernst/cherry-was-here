# Nostalgic globe UI

## Objective
Redesign the app so the globe IS the app: entering Cherry Was Here shows a full-screen globe with only the brand overlay, and everything else (other users, timeline, account, options) lives in a top-left hamburger drawer. Nostalgic look, modern animations.

## Problem / why
The current UI is flat, basic and page-based (explore grid, separate profile pages). The user wants an immersive, nostalgic, animated world.

## Scope
- Full-viewport globe as the main screen (`/`), shared across views; no page-level scroll for the map.
- Brand overlay "Cherry Was Here" (nostalgic serif type).
- Top-left hamburger → animated drawer (staggered entrance) with sections: explore users, my timeline / moments, add moment, account (login/register/logout), options.
- Selecting a user shows their visited countries + moments on the same globe (camera fly-to); `/u/[slug]` still works as a deep link into that state.
- Nostalgic aesthetic: vintage atlas / postcard — paper & sepia palette for land/ocean, subtle paper texture and film grain overlay, serif display font (Google Fonts), moments rendered as stamps/postmarks in lists and popups.
- Modern motion: intro camera move + slow idle auto-rotation that stops on interaction, globe atmosphere/sky, pulsing moment points, fly-to on select, view transitions between drawer panels. All reduced under `prefers-reduced-motion`.

## Out of scope
- API/DB changes (reuse existing endpoints).
- Photos/uploads.

## Constraints
- Project delivery preference: push + open PR without asking (vibecoding); no build gating required, but run checks anyway and report.
- Conventional Commits, no AI attribution. Never commit to `main`.
- TDD: enabled (session config), runner Vitest (`npm test`). Pure logic (e.g. rotation/camera helpers, style recoloring maps) test-first; visual components no unit tests.

## Tasks
- [x] T1 Shell: full-screen globe layout, brand overlay, hamburger + drawer with panels (explore, timeline, account, options); routes map to drawer/globe state. Route: delegated (writer, 2+ files).
- [x] T2 Nostalgic globe styling: sepia/paper basemap recolor, atmosphere/sky, country fills, stamp-like points + popups. Route: delegated.
- [ ] T3 Motion: intro + idle rotation, fly-to, pulsing points, drawer/panel transitions, reduced-motion. Route: delegated.
- [ ] T4 Visual check (headless screenshots desktop + mobile) and README touch-up. Route: delegated.

## Acceptance criteria
- `/` opens on a full-screen globe with only the brand + hamburger visible.
- Every previous feature (explore users, profile, login/register, my timeline, add/delete moment) reachable from the drawer.
- `npm test`, `npx nuxi typecheck`, `npm run build` pass; mobile width has no horizontal scroll.

## Progress / evidence
- Mode: TDD on (session config), runner `npm test` (Vitest). Route: single delegated writer for all tasks; trigger = 2+ non-trivial files per task.
- T1 (`feat(ui): full-screen globe shell with drawer`, commit fd42bbd): RED observed for `groupByEra`/`focusFor` (9 failed) and `postmark` (module missing), then GREEN (32 tests). Typecheck and build pass. Headless Chrome check: `/`, `/u/andrew`, `/login`, `/me` (copy of the DB), mobile 390x844 no horizontal scroll. Findings fixed on the way: maplibre CSS overrides `position: absolute` on its container (wrapped it); SSR renders siblings before an async page finishes, so drawer content is client-only and panel/drawer state is set in a global route middleware.
- T2 (`feat(map): nostalgic atlas globe styling`): RED observed for `restyleLayer`/`restyleLayers` (module missing), GREEN 39 tests. The OpenFreeMap style is fetched and recolored as JSON before map creation (no unstyled flash), globe projection + warm sky set in code, labels switched to Spanish (`name:es`), country labels in letterspaced capitals, stamp-shaped popups (also on tap). Headless check: `/` and `/u/andrew` render with sepia land, teal-grey sea, dashed ink borders, cherry fills and glow points.

## Next step
T3.
