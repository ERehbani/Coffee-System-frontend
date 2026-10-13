# Feature: client-dashboard

Locator: `odd/tasks/client-dashboard.md` · Engram mirror: `odd/client-dashboard/tasks`
Branch: `feature/HU-CLI-02-vista-de-perfil` (from `develop`; was `feat/client-dashboard`)

## Objective

Build the client "Dashboard & Fidelización" view (user profile / loyalty home) as a high-fidelity
mockup that matches `Cliente - Dashboard & Fidelización.pdf`, with its data flowing through an
API-ready boundary so it can be switched from mock data to the real backend once login exists.

## Problem / Why

The app is still the default Angular placeholder. The client home screen is the first view a
logged-in customer sees; the frontend needs it now, while the backend contract is still undefined.

## Scope

- Client shell layout with bottom navigation (Loyalty, Catalog, Cart, Rewards).
- Dashboard page: header, loyalty card, quick actions, active redemptions, nearby cafes,
  featured benefits.
- Model, repository port, HTTP adapter (ready, not active), mock adapter (active), store, under
  `src/features/profile/`; shared layout, bottom nav and icon under `src/shared/components/`.
- Lazy-loaded feature route, client-side rendering for the authenticated route.

Out of scope: login/auth, auth guard and interceptor, catalog/cart/rewards views, real actions
(redeem, scan QR, copy is the only real behavior).

## Constraints

- Every artifact with an Angular schematic is created with `ng generate` (user requirement).
- Colors only from the `@theme` palette in `src/styles.css` (user requirement). The PDF loyalty
  card uses a slate background; it is mapped to `primary-dark` → `text` to respect the palette.
- Angular 22 conventions from the project GEMINI guide: standalone, signals, `input()`/`output()`,
  native control flow, no `ngClass`/`ngStyle`, `inject()`, `NgOptimizedImage`, WCAG AA / AXE.
- Screaming architecture (user layout, since T4): feature folder `src/features/profile/` with
  `profile.routes.ts`, `pages/` (container: `profile-page`), `components/` (presentational),
  `services/` (store, repository port, mock and HTTP adapters), `types/` (model, DTO) and
  `utils/` (loyalty progress, mapper, fixture). Cross-feature UI lives in `src/shared/components/`
  (`icon`, `bottom-nav`, `client-layout`). Relative imports, no path aliases.
  Historical (T1–T3): feature folder `src/app/client-dashboard/` with `domain`, `application`,
  `infrastructure`, `ui`; layout in `src/app/layout/`, icon in `src/app/shared/ui/`.
- No new spec files (user requirement, since T4): `angular.json` schematics set `skipTests: true`
  for component, class, directive, guard, interceptor, pipe, resolver and service. The
  pre-existing `src/app/app.spec.ts` stays (user requirement, T5).
- Number/currency formats follow `es-AR` (user requirement, T5): `LOCALE_ID` `es-AR`,
  `DEFAULT_CURRENCY_CODE` `ARS`; format numbers through Angular pipes or `formatNumber` with the
  injected `LOCALE_ID`, never `toFixed`/hardcoded separators.
- Code identifiers and comments in English; UI copy in Spanish, mirroring the PDF.
- Angular CLI 22 rejects system Node 24.13.0; run it with
  `fnm exec --using=22.23.3 node node_modules/@angular/cli/bin/ng.js <args>`.

## API contract (proposal, pending backend confirmation)

`GET {apiBaseUrl}/clients/me/dashboard` → aggregated dashboard DTO for the authenticated client
(profile, loyalty status, active redemptions, nearby cafes, featured benefits). The future auth
interceptor attaches the session token; the HTTP adapter does not handle auth itself.

## Tasks

- [x] **T1 — Shell scaffolding**: environments (`apiBaseUrl`, `useMockApi`), `provideHttpClient`,
  lazy routes, client layout + bottom nav, icon component, `index.html` (lang/title/font),
  SSR client render for the dashboard route, replace placeholder `app.html`, fix `app.spec.ts`.
  Route: delegated (writer trigger: 2+ non-trivial files).
- [x] **T2 — Data layer**: domain model + pure loyalty/expiry functions, repository port, DTO,
  mapper, mock fixture + mock adapter, HTTP adapter, store (signals/resource). Test-first for pure
  functions, mapper and store. Route: delegated (writer trigger).
- [x] **T3 — Dashboard UI**: presentational components + container page wired to the store,
  loading/error/empty states, accessibility, component tests. Route: delegated (writer trigger).
- [x] **T4 — Restructure + remove tests**: remove every `*.spec.ts` and skip specs in schematics;
  move the feature into the user's screaming layout (`src/features/profile`,
  `src/shared/components`) with `git mv`, renaming `ClientDashboard*` identifiers to `Profile*`
  (`ProfilePage`, `ProfileStore`, `ProfileRepository`, `MockProfileRepository`,
  `HttpProfileRepository`, `ProfileDashboard`, `ProfileDashboardDto`, `toProfileDashboard`,
  `buildProfileDashboardFixture`). No behavior change: route path `dashboard`, `RenderMode.Client`
  and the API endpoint are unchanged. Route: delegated (writer trigger: 2+ non-trivial files).
- [x] **T5 — Restore app spec + es-AR formats**: restore the pre-existing `src/app/app.spec.ts`
  (only the obsolete placeholder-title assertion adapted to the new shell); register `es-AR`
  locale data, `LOCALE_ID` and `DEFAULT_CURRENCY_CODE`; percent via `PercentPipe`, distance and
  review count via `formatNumber`; `<html lang="es-AR">`. Route: inline (mechanical, understood
  edits).
- [x] **T6 — Route `/profile`**: the client view moves from `/dashboard` to `/profile` (root and
  unknown URLs redirect there; server `RenderMode.Client` and the bottom nav "Loyalty" link
  follow). The API endpoint `/clients/me/dashboard` is unchanged. Route: inline (mechanical).

## Acceptance criteria

- `/profile` renders the PDF layout with mock data using only palette colors (was `/dashboard`
  until T6).
- Switching `useMockApi` to `false` makes the page consume the HTTP adapter with no UI changes.
- `ng build` passes. (Historical, T1–T3: `ng test --watch=false` also passed; tests were removed
  in T4 at the user's request.)
- Text/background pairs meet WCAG AA contrast; icon-only controls have accessible names.

## Checks

- `ng build` (includes SSR/prerender) and `ng test --watch=false` (only `src/app/app.spec.ts`).
- Feature specs were removed in T4 at the user's request; the original app spec was restored in
  T5. Historical, T1–T3: the full Vitest evidence is kept below for the record.

## Delivery

- Strategy: `ask-on-risk`. Forecast ≈ 1,500 authored changed lines (> 400): chain strategy
  (`stacked-to-main` / `feature-branch-chain`) to be asked before any PR is opened.
- RDD: off (global). Ordinary checks only.

## Progress / Evidence

Historical note: T1–T3 test evidence and file paths (`src/app/client-dashboard/...`,
`shared/ui/icon/...`) predate T4, which removed the specs and moved the files.

- T1 (route: delegated) — `ng test --watch=false`: 5 files / 8 tests passed. `ng build`: success,
  no warnings, 1 static route prerendered, `/dashboard` client-rendered. Commit `a490c37`.
  Icons: 20 Lucide (ISC) icons normalized to path data in `shared/ui/icon/icon-registry.ts`
  (pinned `lucide-static@0.460.0`).
- T2 (route: delegated) — test-first. RED observed: `loyalty-progress.spec` 11/11 failed
  ("Not implemented"), `client-dashboard.mapper.spec` 7/7 failed ("Not implemented"),
  `client-dashboard.store.spec` 4/4 failed (assertions against a stub). GREEN: 11/11, 7/7, 4/4.
  Full `ng test --watch=false`: 10 files / 34 tests passed. `ng build`: success, no warnings.
  Commit `5ddc15a`. Decisions: progress rounds down to one decimal (never shows 100% early);
  expiry counts calendar days in local time; unknown tier codes and invalid dates make the mapper
  throw, which surfaces as the store error state.
- T3 (route: delegated) — `ng test --watch=false`: 14 files / 53 tests passed, no console
  warnings. `ng build`: success, no warnings (no budget or `NgOptimizedImage` warnings). Visual
  check of the production build through Edge DevTools emulation: no horizontal overflow at 320,
  375 and 820 px (`scrollWidth === innerWidth`); 375 px render matches the PDF layout. Size:
  ~1,050 added lines (7 presentational components + container, each with template, and 6
  specs), above the 400-line heuristic because each section is its own small component.
  A11y: adjacent inline spans get `&ngsp;` separators (Angular drops whitespace-only text nodes,
  which made "4.9" + "8 reseñas" read as "4.98 reseñas"). Commit `cd85569`.
- T4 (route: delegated, writer trigger: 2+ non-trivial files) — 14 spec files removed with
  `git rm` (incl. `app.spec.ts`); `skipTests: true` added for the 8 schematics whose schema
  supports it (all 8 do in `@schematics/angular` 22.1.8). `ng build` after removal: success, no
  warnings. Commit `1cb7a2e`. Restructure: 31 files moved with `git mv` into
  `src/features/profile` and `src/shared/components`; old `src/app/client-dashboard`,
  `src/app/layout`, `src/app/shared` removed; no `ClientDashboard`/`client-dashboard`/`app/layout`/
  `app/shared` references left in `src/`. `ng build`: success, no warnings, 1 static route
  prerendered, lazy chunk now `profile-routes`. Commit `58d34f4`. Git pairs 27 moves as renames
  at the default 50% similarity; the 4 small files with most identifiers renamed
  (`profile.routes.ts` and the three repositories) pair at 30–40%, so trace them with
  `git log --follow -M30%`.
- T5 (route: inline) — `es-AR` output verified with `formatNumber`/`formatPercent`: `1.420`,
  `3.000`, `4,9`, `47,3%`, `1,2`. Distance now reads `A 450 m` / `A 1,2 km`. `ng test
  --watch=false`: 1 file / 2 tests passed. `ng build`: success, no warnings.
- T6 (route: inline) — 5 replacements in `app.routes.ts`, `app.routes.server.ts`,
  `bottom-nav.ts`. `ng test --watch=false`: 1 file / 2 tests passed. `ng build`: success, no
  warnings.

## Next step

Feature complete (T6). Before opening any PR: ask the chain strategy (forecast > 400 lines).
