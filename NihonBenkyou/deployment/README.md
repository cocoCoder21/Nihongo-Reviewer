# NihonBenkyou! — Deployment Guide

Production architecture and step-by-step deployment instructions for `angeliephl.dev/nihonbenkyou`.

## Architecture Overview

```
Browser
  └── angeliephl.dev/nihonbenkyou/        (portfolio Vercel project — proxy rewrite)
        └── nihon-benkyou-XXXX.vercel.app/  (NihonBenkyou Vercel project)
              └── api.angeliephl.dev          (Railway — Express API + PostgreSQL)
```

| Layer | Service | URL |
|---|---|---|
| Frontend | Vercel (own project) | `angeliephl.dev/nihonbenkyou/` |
| Backend API | Railway | `https://api.angeliephl.dev/api` |
| Database | Railway PostgreSQL plugin | internal |
| Proxy | Portfolio `vercel.json` rewrites | `angeliephl.dev` → NihonBenkyou Vercel |

## Deployment Steps

1. [Pre-deployment code changes](./01-pre-deployment.md) ← **start here**
2. [Railway — Backend + Database](./02-railway-setup.md)
3. [Vercel — Frontend](./03-vercel-frontend.md)
4. [Portfolio proxy setup](./04-portfolio-proxy.md)
5. [Verification checklist](./05-verification.md)
6. [Environment variables reference](./env-variables.md)

## Key Decisions

- Path is `/nihonbenkyou` (lowercase, no `!`) — `!` breaks Vercel rewrite matchers.
- Custom domain split: `angeliephl.dev` (frontend proxy) + `api.angeliephl.dev` (backend).
- Frontend and backend share the same eTLD+1 → `sameSite: 'strict'` cookies work cross-subdomain. **No auth code changes needed.**
- `prisma migrate deploy` is used in production (NOT `db push`).
- Database is seeded **locally** pointing at the Railway public DB URL — the seed script reads markdown content files that live outside the `server/` folder and are not deployed to Railway.

## Prerequisites

- [ ] GitHub repo pushed with the latest deployment-ready code
- [ ] Railway account at [railway.com](https://railway.com)
- [ ] Vercel account with `angeliephl.dev` already connected
- [ ] Access to `angeliephl.dev` DNS (or Vercel manages DNS)
- [ ] PostgreSQL client installed locally (for one-time seeding)
