# Step 5 — Post-Deployment Verification

Run through this checklist after all four deployment steps are complete.

## Backend Checks

- [ ] **Health endpoint**
  ```bash
  curl https://api.angeliephl.dev/api/health
  ```
  Expected: `{"status":"ok","database":"connected"}`
  Fail → check Railway logs, `DATABASE_URL` reference, PostgreSQL plugin status.

- [ ] **HTTPS**: Browser shows lock icon for `api.angeliephl.dev`. Railway auto-provisions Let's Encrypt SSL.

- [ ] **Rate limiting**: 21st rapid login request within 15 minutes returns 429.

## Frontend Checks

- [ ] **App loads**: `https://angeliephl.dev/nihonbenkyou` renders the login page.
  Fail → check portfolio `vercel.json` rewrites and the NihonBenkyou Vercel deployment is live.

- [ ] **Asset loading**: DevTools → Network tab shows zero 404s for JS/CSS/font files. Asset URLs should look like `/nihonbenkyou/assets/index-XXXX.js`.
  Fail → confirm `VITE_APP_BASE_PATH=/nihonbenkyou/` was set on Vercel **before** the build ran (env var changes require a redeploy).

- [ ] **Direct route navigation**: Hard-refresh on `https://angeliephl.dev/nihonbenkyou/learn/grammar` → page renders (not 404).
  Fail → confirm `NihonBenkyou/vercel.json` has the `/(.*) → /index.html` rewrite.

- [ ] **In-app navigation**: Click through routes. Browser URL shows `/nihonbenkyou/learn`, `/nihonbenkyou/practice`, etc.
  Fail → confirm `VITE_APP_BASE_PATH` was set in Vercel **Production** only.

## Authentication Checks

- [ ] **Register**: Create a new account → redirects to dashboard.
  Fail → check backend `/api/auth/register` log, JWT secrets, DB has `User` table.

- [ ] **Cookies set**: DevTools → Application → Cookies → `angeliephl.dev` shows `access_token` and `refresh_token` (httpOnly, Secure, SameSite=Strict).
  Fail → confirm `NODE_ENV=production` on Railway and frontend uses HTTPS.

- [ ] **Token refresh**: After 15 minutes (or manually delete `access_token` cookie), make any API call → app should auto-refresh, no forced logout.
  Fail → check refresh cookie path is `/api/auth/refresh` and `VITE_API_URL` is correct.

- [ ] **Logout**: Cookies cleared, redirects to login.

## CORS Check

- [ ] DevTools console shows **zero** CORS errors during normal use.
  Fail → set `CORS_ORIGIN=https://angeliephl.dev` on Railway. Note: do NOT include the Vercel `.vercel.app` URL — users only access via the proxy.

## Database / Content Checks

- [ ] **Lessons load**: Open a lesson page → vocabulary, grammar, examples appear.
- [ ] **Kana**: Open kana study → hiragana/katakana characters appear.
- [ ] **Kanji**: Open kanji section → kanji with radicals appear.

Fail → seed didn't run. From your laptop, follow [Step 2.7](./02-railway-setup.md#27--seed-the-database-from-your-laptop).

## Rollback

If a critical issue is found post-deploy:

1. **Railway**: Service → **Deployments** → click previous deploy → **Redeploy**.
2. **Vercel** (NihonBenkyou): **Deployments** → click previous deploy → **Promote to Production**.
3. **Portfolio**: `git revert` the `vercel.json` change in the portfolio repo and push.

For database rollback, restore from Railway's automatic backups (Settings → **Backups** in the PostgreSQL service).
