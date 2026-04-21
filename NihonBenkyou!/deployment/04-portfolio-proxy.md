# Step 4 — Portfolio Proxy Setup

This step makes NihonBenkyou! accessible at `angeliephl.dev/nihonbenkyou` by adding Vercel rewrite rules to the **portfolio** project (not this repo).

## 4.1 — Get the NihonBenkyou Vercel URL

From [Step 3.4](./03-vercel-frontend.md), you have a URL like:

```
https://nihon-benkyou-XXXX.vercel.app
```

## 4.2 — Edit portfolio's `vercel.json`

In your **portfolio project repo** (the one serving `angeliephl.dev`), edit (or create) `vercel.json` at the repo root.

### If vercel.json doesn't exist yet

```json
{
  "rewrites": [
    {
      "source": "/nihonbenkyou",
      "destination": "https://nihon-benkyou-XXXX.vercel.app/"
    },
    {
      "source": "/nihonbenkyou/:path*",
      "destination": "https://nihon-benkyou-XXXX.vercel.app/:path*"
    }
  ]
}
```

### If vercel.json already exists

Merge the two rewrites **before** any catch-all rules (e.g., `"source": "/(.*)"`). Order matters — Vercel evaluates rewrites top-to-bottom and stops at the first match.

Replace `nihon-benkyou-XXXX.vercel.app` with your actual Vercel deployment URL from Step 3.4.

## 4.3 — Commit and push to portfolio repo

```bash
git add vercel.json
git commit -m "chore: proxy /nihonbenkyou to NihonBenkyou app"
git push
```

Vercel auto-deploys the portfolio on push.

## 4.4 — Verify

Visit: `https://angeliephl.dev/nihonbenkyou`

The login page should load. Click around — URLs should show `angeliephl.dev/nihonbenkyou/learn`, `/nihonbenkyou/practice`, etc.

## How the proxy works

```
User visits: angeliephl.dev/nihonbenkyou/learn/grammar
   ↓
Portfolio Vercel matches: /nihonbenkyou/:path*
   ↓ rewrites destination to: https://nihon-benkyou-XXXX.vercel.app/learn/grammar
   ↓ (browser URL bar still shows angeliephl.dev/nihonbenkyou/learn/grammar)
NihonBenkyou Vercel receives: GET /learn/grammar
   ↓
NihonBenkyou vercel.json catches unmatched paths → serves /index.html
   ↓
React Router (basename: '/nihonbenkyou') strips prefix → matches /learn/grammar
   ↓
GrammarLesson page renders
```

### Why assets work

The built `index.html` references assets like `/nihonbenkyou/assets/index-XXXX.js` (because `VITE_APP_BASE_PATH=/nihonbenkyou/`). When the browser fetches `angeliephl.dev/nihonbenkyou/assets/index-XXXX.js`, the portfolio's `/nihonbenkyou/:path*` rewrite catches it and proxies to `nihon-benkyou-XXXX.vercel.app/assets/index-XXXX.js`, which Vercel serves directly from the static `dist/`.
