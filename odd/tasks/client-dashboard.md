# Feature: client-dashboard

Locator: `odd/tasks/client-dashboard.md` · Engram mirror: `odd/client-dashboard/tasks`
Branch: `feat/client-dashboard` (from `develop`)

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
- Domain model, repository port, HTTP adapter (ready, not active), mock adapter (active), store.
- Lazy-loaded feature route, client-side rendering for the authenticated route.

Out of scope: login/auth, auth guard and interceptor, catalog/cart/rewards views, real actions
(redeem, scan QR, copy is the only real behavior).

## Constraints

- Every artifact with an Angular schematic is created with `ng generate` (user requirement).
- Colors only from the `@theme` palette in `src/styles.css` (user requirement). The PDF loyalty
  card uses a slate background; it is mapped to `primary-dark` → `text` to respect the palette.
- Angular 22 conventions from the project GEMINI guide: standalone, signals, `input()`/`output()`,
  native control flow, no `ngClass`/`ngStyle`, `inject()`, `NgOptimizedImage`, WCAG AA / AXE.
- Screaming architecture: feature folder `client-dashboard/` with `domain`, `application`,
  `infrastructure`, `ui` (container-presentational).
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
- [ ] **T2 — Data layer**: domain model + pure loyalty/expiry functions, repository port, DTO,
  mapper, mock fixture + mock adapter, HTTP adapter, store (signals/resource). Test-first for pure
  functions, mapper and store. Route: delegated (writer trigger).
- [ ] **T3 — Dashboard UI**: presentational components + container page wired to the store,
  loading/error/empty states, accessibility, component tests. Route: delegated (writer trigger).

## Acceptance criteria

- `/dashboard` renders the PDF layout with mock data using only palette colors.
- Switching `useMockApi` to `false` makes the page consume the HTTP adapter with no UI changes.
- `ng build` and `ng test --watch=false` pass.
- Text/background pairs meet WCAG AA contrast; icon-only controls have accessible names.

## Checks

- `ng test --watch=false` (Vitest) · `ng build` (includes SSR/prerender).

## Delivery

- Strategy: `ask-on-risk`. Forecast ≈ 1,500 authored changed lines (> 400): chain strategy
  (`stacked-to-main` / `feature-branch-chain`) to be asked before any PR is opened.
- RDD: off (global). Ordinary checks only.

## Progress / Evidence

- T1 (route: delegated) — `ng test --watch=false`: 5 files / 8 tests passed. `ng build`: success,
  no warnings, 1 static route prerendered, `/dashboard` client-rendered. Commit: T1 hash recorded
  in the T2 entry. Icons: 20 Lucide (ISC) icons normalized to path data in
  `shared/ui/icon/icon-registry.ts` (pinned `lucide-static@0.460.0`).

## Next step

T2 — data layer.
