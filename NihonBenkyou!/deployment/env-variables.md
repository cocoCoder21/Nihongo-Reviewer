# Environment Variables Reference

## Backend — Railway

Set in Railway service → **Variables** tab.

| Variable | Required | Value / Notes |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `3001` |
| `DATABASE_URL` | ✅ | **Reference** from PostgreSQL plugin (do not paste manually) |
| `JWT_SECRET` | ✅ | Random 32+ char string. Generate: `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | ✅ | Random string, **different from `JWT_SECRET`**. Generate same way |
| `CORS_ORIGIN` | ✅ | `https://angeliephl.dev` |

### Generating secure secrets

```bash
# Generates a 64-character base64 string (run twice for two different values)
openssl rand -base64 48

# Or with Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

> ⚠️ Never commit real secret values to Git. The `.env` file is in `.gitignore`.

## Frontend — Vercel (NihonBenkyou project)

Set in Vercel project → **Settings** → **Environment Variables**.

| Variable | Environment | Value |
|---|---|---|
| `VITE_API_URL` | Production + Preview | `https://api.angeliephl.dev/api` |
| `VITE_APP_BASE_PATH` | **Production only** | `/nihonbenkyou/` |

> `VITE_APP_BASE_PATH` is set for Production **only**. Preview deploys run at `/`, so the basename must default to `/` (which it does when the variable is absent). Trailing slash on `/nihonbenkyou/` is **required** for Vite's `base` option.

> Vite inlines `import.meta.env.*` at build time, so changing these variables requires a redeploy.

## Local Development

### Backend `.env` ([`server/.env.example`](../server/.env.example))

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nihon_benkyou?schema=public"
JWT_SECRET="dev-secret-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env` ([`.env.example`](../.env.example))

Optional locally — defaults are sensible. Only needed if testing against a non-default backend URL.

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_BASE_PATH=/
```
