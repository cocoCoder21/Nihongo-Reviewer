# Step 2 — Railway Setup (Backend + Database)

## 2.1 — Create Railway project

1. Go to [railway.com](https://railway.com) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `nihongo-trainer` repo

## 2.2 — Configure the service

In the service **Settings** tab:

| Setting | Value |
|---|---|
| **Root Directory** | `minna-no-nihongo-reviewer/NihonBenkyou/server` |
| **Watch Paths** | `minna-no-nihongo-reviewer/NihonBenkyou/server/**` |

> Watch paths prevent unnecessary rebuilds when only the frontend or markdown content changes.

Build/start commands and the healthcheck come from [`server/railway.toml`](../server/railway.toml) — no manual configuration needed.

## 2.3 — Add PostgreSQL database

1. In the Railway project canvas, click **+ New** → **Database** → **PostgreSQL**
2. Once provisioned, open the PostgreSQL service → **Variables** tab → copy `DATABASE_PUBLIC_URL` (you'll need this for seeding in Step 2.7)
3. Open the **server** service → **Variables** tab → click **+ New Variable** → **Add Reference** → select the PostgreSQL service → choose `DATABASE_URL`

> Railway uses the **internal** `DATABASE_URL` for the server (faster, free egress). The **public** URL is only used for one-time seeding from your laptop.

## 2.4 — Set environment variables

In the **server** service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | *(generate: `openssl rand -base64 48`)* |
| `JWT_REFRESH_SECRET` | *(generate: `openssl rand -base64 48` — must differ from `JWT_SECRET`)* |
| `CORS_ORIGIN` | `https://angeliephl.dev` |
| `DATABASE_URL` | *(reference from PostgreSQL plugin — set in 2.3)* |

Generate secrets in your terminal:

```bash
openssl rand -base64 48
```

Run twice (one for each secret). They must be different values.

## 2.5 — Deploy

Railway auto-deploys after env vars are set. Watch the **Deployments** tab for the build log. Look for:

```
✅ Build successful
✅ prisma migrate deploy → No pending migrations to apply
✅ Server running on http://localhost:3001
```

## 2.6 — Add custom domain `api.angeliephl.dev`

1. Server service → **Settings** → **Networking** → **Custom Domain**
2. Enter: `api.angeliephl.dev`
3. Railway shows a **CNAME target** (e.g., `XXXX.up.railway.app`)
4. In your DNS provider (or Vercel DNS for `angeliephl.dev`), add:
   ```
   CNAME  api  →  XXXX.up.railway.app
   ```
5. Wait for DNS propagation (5–30 min). Railway auto-provisions SSL.

Verify:

```bash
curl https://api.angeliephl.dev/api/health
# Expected: {"status":"ok","database":"connected"}
```

## 2.7 — Seed the database (from your laptop)

> ⚠️ **Why local seeding?** The seed script reads markdown content files (`Kanji/`, `shokyu/`, `chukyu/`) that live in the repo root — outside the `server/` folder. Railway only deploys the `server/` folder, so those files are not available there. Solution: run the seed locally, pointed at the Railway public DB URL.

1. Get the public DB URL from PostgreSQL service → **Variables** → `DATABASE_PUBLIC_URL`
2. In your local terminal:

   ```bash
   cd "minna-no-nihongo-reviewer/NihonBenkyou/server"

   # Replace with your actual Railway public DB URL
   $env:DATABASE_URL = "postgresql://postgres:XXXX@XXXX.proxy.rlwy.net:NNNNN/railway"

   # Run main seed (vocabulary, grammar, kanji, kana, lessons)
   npm run db:seed

   # Optional: seed example sentences
   npm run db:seed-examples
   ```

   *(Bash/zsh: use `export DATABASE_URL=...` instead of `$env:DATABASE_URL=...`)*

3. **Unset the env var** when done so you don't accidentally push to prod from local dev:

   ```bash
   Remove-Item Env:DATABASE_URL
   ```

The seed is idempotent (uses `upsert`) — safe to re-run if needed.
