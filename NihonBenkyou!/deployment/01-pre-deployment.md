# Step 1 — Pre-Deployment Code Changes

> **Status:** ✅ Already implemented in this repo. This document describes what was done so future contributors understand the setup.

## 1.1 — Vite base path (DONE)

**File:** [`vite.config.ts`](../vite.config.ts)

```ts
base: process.env.VITE_APP_BASE_PATH ?? '/',
```

Reads `VITE_APP_BASE_PATH` at **build time**. Defaults to `/` so local dev and Vercel Preview deploys still work. In Production (Vercel) it's set to `/nihonbenkyou/` so all asset URLs in the built `index.html` are prefixed correctly and match the portfolio proxy rewrite.

## 1.2 — React Router basename (DONE)

**File:** [`src/app/routes.tsx`](../src/app/routes.tsx)

```ts
createBrowserRouter([...], {
  basename: (import.meta.env.VITE_APP_BASE_PATH ?? '/').replace(/\/$/, '') || '/',
});
```

Reads `VITE_APP_BASE_PATH` at **build time** (Vite inlines `import.meta.env.*`). Trailing slash is stripped because React Router's `basename` must not end in `/`. Falls back to `/` when unset.

## 1.3 — Vercel SPA rewrite (DONE)

**File:** [`vercel.json`](../vercel.json)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Without this, navigating directly to `/learn/grammar` returns 404 because Vercel looks for a static file at that path. The rewrite serves `index.html` instead, letting React Router handle routing client-side. Static assets in `dist/` are matched first by Vercel before rewrites.

## 1.4 — Railway service config (DONE)

**File:** [`server/railway.toml`](../server/railway.toml)

Defines build/start commands and the `/api/health` healthcheck. Railway reads this on every deploy.

## 1.5 — Node engines (DONE)

Both [`package.json`](../package.json) and [`server/package.json`](../server/package.json) declare `"engines": { "node": ">=20.0.0" }` so Railway and Vercel use Node 20 (required by Prisma 7 and Express 5).

## 1.6 — Generate initial Prisma migration (MANUAL)

Run this **once** locally before the first Railway deploy:

```bash
cd "minna-no-nihongo-reviewer/NihonBenkyou!/server"
npx prisma migrate dev --name init
```

This creates `server/prisma/migrations/` with the initial SQL migration. Railway runs `prisma migrate deploy` at startup, which **requires** migration files to exist in the repo. Without this step, the database schema will not be created on Railway.

> **Important:** Commit the generated `migrations/` folder to Git.

## 1.7 — Commit and push

```bash
git add .
git commit -m "chore: configure deployment for angeliephl.dev/nihonbenkyou"
git push
```

All subsequent deploy steps pull from this pushed state.

## What's NOT changed (and why)

- **`server/src/index.ts`** — CORS already reads `process.env.CORS_ORIGIN` (comma-split). No code change needed.
- **`server/src/middleware/auth.ts`** — Cookie config already toggles `secure`/`sameSite` based on `NODE_ENV`. No code change needed.
- **`src/app/services/api.ts`** — `API_BASE_URL` already reads `import.meta.env.VITE_API_URL`. No code change needed.
