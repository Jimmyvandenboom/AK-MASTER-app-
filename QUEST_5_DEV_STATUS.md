# GFR Exam Quest 5.0 — Development branch

**Branch:** `feature/gfr-quest-5-foundation`
**Status:** development only — **do not merge or publish without a green CI run and manual browser review**.

## Goals completed in this branch
- First personal expedition-camp lobby, driven by existing student XP and read-only profile data
- Responsive geography atlas for H7 Netherlands, H8 China, H9 Middle East
- Central actions to existing shop, Avatar Studio, personal quest and knowledge boost
- Light/dark CSS and reduced-motion support
- Legacy question/map/quiz views retained
- Battle Pass navigation hidden (existing rewards preserved)
- Added Quest 5 unit tests and adapted Playwright smoke assertions
- Added a branch-only GitHub Actions workflow which does not deploy to Pages

## Safety
- No SQL schema or row mutations performed
- No Supabase student data extracted; only aggregate row counts inventoried
- Existing authentication and recovery flow untouched until migration strategy is tested
- `main` is unchanged, as is the live student URL
- The new UI is **not yet a final 3D geographic engine**; it is the phase-2 styling/interaction foundation

## Test requirements before a preview release
1. `npm ci && npm test && npm run build`
2. `npx playwright install --with-deps chromium`
3. `npm run test:pages && node scripts/check-quest.mjs`
4. Verify desktop light/dark, mobile scrolling and tap targets, old accounts and recovered sessions
5. Inspect design on at least 390px mobile and 1365px desktop
6. Confirm Supabase rewards/purchases/attempts match before and after testing with nonproduction test players
7. Publish only after explicit approval

## Next development
- Replace initial CSS diorama/illustrated region previews with a true performant isometric terrain renderer
- Build an authenticated player login migration without discarding old recovery codes
- Confirm review of complete CE source and AI grading workflows
- Add accessible focus and navigation tests for all major controls

## Supabase snapshot (22 Nov 2026, aggregate counts only)
`quest_students`: 31; `quest_attempts`: 529; `quest_purchases`: 18; `quest_rewards`: 207.

These counts are an **inventory**, not a database backup. A real backup/export remains required before any migration.

## Development increment: vector atlas (22 Nov 2026)
- Added `public/quest/v5-terrain.js` with three self-contained SVG isometric geography miniatures: Dutch polder/dikes, Chinese river/mountains/dam, Middle East arid land/oasis.
- Connected the miniatures to existing clickable geography regions in `v5-lobby.js`; updated mobile styling and unit/browser test assertions.
- Ran eight direct runtime checks of atlas markup/navigation, progress immutability, labels and escaping — **8/8 passed**.
- This is **not a claim of Playwright success**. CI status was not returned by the GitHub status API; full build/browser verification remains a release blocker.
- Production Pages remains on `main`, no database writes occurred.
