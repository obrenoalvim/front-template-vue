# front-template-vue

Vue 3 + Vite frontend template consuming the Laravel API (`back-template-laravel`). Auth, i18n (en/pt), dark/light mode, forms with translated validation, TanStack Query, SEO, Docker, and CI wired up so a real feature is a copy-paste away.

## Stack

- Vue 3 + Vite + TypeScript, Pinia, Vue Router
- Tailwind v4 + a copy-in `shadcn`-style UI kit (`src/components/ui`)
- `vue-i18n` (en/pt), locale-aware routing (`/en/*`, `/pt/*`)
- `vee-validate` + `zod`, validation messages routed through i18n globally
- `@tanstack/vue-query` for server-state caching
- `vue-sonner` for toasts
- `@unhead/vue` for per-page SEO/OG/canonical tags
- Vitest (unit) + Playwright (e2e)

## Project setup

```sh
npm install
cp .env.example .env   # already has working local defaults
npm run dev
```

### Scripts

```sh
npm run dev            # start Vite dev server
npm run build           # type-check, build, generate sitemap.xml/robots.txt
npm run start            # preview the production build
npm run test              # unit tests (vitest run)
npm run test:watch         # unit tests, watch mode
npm run test:e2e            # Playwright (needs `npx playwright install` once)
npm run lint / format / format:check
npm run docker:up / docker:down
```

## Environment variables

Validated at startup (`src/lib/env.ts`) — the app throws immediately with a readable message if one is missing or malformed, instead of failing later downstream.

| Var             | Purpose                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `VITE_API_URL`  | Base URL of the Laravel API this frontend calls.                                              |
| `VITE_SITE_URL` | Public URL this frontend is served from — used for canonical links, OG tags, and the sitemap. |

See `.env.example`.

## Docker

```sh
npm run docker:up
```

Multi-stage build: Node builds the static bundle, `nginx-unprivileged` (non-root by default) serves it on port 8080 with a `/health` endpoint and SPA fallback routing. `VITE_API_URL`/`VITE_SITE_URL` are baked in at **build time** (Vite inlines them into the JS bundle) via Docker build args — see the comments in `docker-compose.yml` before changing them.

## Design notes and gotchas

- **Zod's error map is global and i18n-aware.** `src/lib/zod-i18n.ts` overrides `z.setErrorMap` once, at app boot, so every schema's built-in messages (required/email/min length) are translated automatically — you don't write per-field error strings. `.refine()` messages are the exception: they're evaluated once when the schema object is built (inside a component's `setup()`), so a `t()` call baked into a `.refine()` message won't retranslate if the user switches locale without remounting the form. Fine for this template's scope; if it bites you, move the mismatch check out of the schema and into `handleSubmit`.
- **`src/lib/env.ts` runs before i18n exists**, and is imported first in `main.ts` on purpose — it can't rely on the translated zod error map (chicken-and-egg), so it passes explicit `message` strings to `z.string().url({ message: ... })` instead of leaning on the global map.
- **Locale-aware links use `LocaleLink`, not `RouterLink` directly.** Raw `RouterLink to="/foo"` would drop the `/en`/`/pt` prefix. The one exception is inside `LocaleLink.vue` itself.
- **The auth guard and the locale sync live in one `router.beforeEach`** (`src/router/index.ts`), not two separate guards — checklist calls for a single centralized guard, and splitting locale-sync from auth-check invites them going out of sync on redirect order.
- **This is a pure SPA (no SSR).** Meta tags set via `@unhead/vue` update the DOM after the JS bundle runs, which is fine for browsers and most modern crawlers, but classic OG scrapers (some social-share previews) that don't execute JS won't see them. If that matters for your deployment, add prerendering or SSR — out of scope here.
- **`e2e/auth.spec.ts`'s register→logout test needs a live Laravel API** at `VITE_API_URL`. It self-skips in CI unless `E2E_API_URL` is set (see `.github/workflows/ci.yml`), because this repo doesn't run the Laravel API as a CI service. The auth-guard test in the same file doesn't need a backend and always runs.
- **Docker build args vs. `.env`**: `docker-compose.yml` uses `DOCKER_VITE_API_URL`/`DOCKER_VITE_SITE_URL`, not `VITE_API_URL`/`VITE_SITE_URL` directly — Compose auto-loads this project's `.env` for variable substitution, and that file already defines the plain names for local `npm run dev`. Reusing them in `docker-compose.yml` would silently bake your dev-server URLs into the production image.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.
