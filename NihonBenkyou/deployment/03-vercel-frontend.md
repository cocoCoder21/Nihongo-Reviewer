# Step 3 — Vercel Frontend Deployment

## 3.1 — Import project

1. [vercel.com/new](https://vercel.com/new) → import your GitHub repo
2. Set **Root Directory** to:
   ```
   minna-no-nihongo-reviewer/NihonBenkyou
   ```

## 3.2 — Confirm build settings

Vercel auto-detects Vite. Verify:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node Version** | 20.x (auto from `engines`) |

## 3.3 — Set environment variables

Before clicking **Deploy**, add these in **Environment Variables**:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://api.angeliephl.dev/api` | Production, Preview |
| `VITE_APP_BASE_PATH` | `/nihonbenkyou/` | **Production only** |

> ⚠️ `VITE_APP_BASE_PATH` must be **Production only**. Preview deploys run at `/` and need the basename to default to `/`. The trailing slash on `/nihonbenkyou/` is **required** for Vite's `base` option.

## 3.4 — Deploy

Click **Deploy**. First build takes 2–3 minutes.

After deploy, Vercel shows the production URL (e.g., `nihon-benkyou-XXXX.vercel.app`).

**Copy this URL** — you need it for [Step 4](./04-portfolio-proxy.md).

## 3.5 — Do NOT add `angeliephl.dev` here

The NihonBenkyou Vercel project sits behind the portfolio's proxy rewrite. The user-facing URL is `angeliephl.dev/nihonbenkyou`, configured in Step 4 on the portfolio project. Adding `angeliephl.dev` directly here would conflict with the portfolio.

## 3.6 — Verify standalone deployment

Visit `https://nihon-benkyou-XXXX.vercel.app/` directly (the Vercel-assigned URL).

> ⚠️ This URL **will not load correctly** in Production because `VITE_APP_BASE_PATH=/nihonbenkyou/` was baked into the build. Assets will 404 because the browser requests `/nihonbenkyou/assets/...` but Vercel serves them at `/assets/...`.
>
> This is expected and intentional — the app is only meant to be accessed through the portfolio proxy at `angeliephl.dev/nihonbenkyou`.
>
> To verify the build itself works, check a **Preview** deployment instead (e.g., from a feature branch), where `VITE_APP_BASE_PATH` is unset.
