# Deploy `frontend-next` preview on Vercel

Production (`mercygold.co.ke`) stays on the **Vite** app from `main` via the existing Vercel project.

This document sets up a **second** Vercel project for the Next.js storefront (WIP), usually from the **`dev`** branch.

## 1. Create the project

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → **Add New…** → **Project**
2. Import **`mburumanasseh/honey-shop`**
3. Configure:

| Setting | Value |
|--------|--------|
| **Project name** | `mercy-gold-next` (or similar — not the same as the Vite project) |
| **Root Directory** | `frontend-next` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default) |
| **Install Command** | `npm install` (default) |
| **Production Branch** | `dev` (so this project tracks Next work, not `main`) |

4. **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://honey-shop-260z.onrender.com` |

5. Deploy.

You will get a URL like:

`https://mercy-gold-next.vercel.app`

and per-commit previews:

`https://mercy-gold-next-git-dev-….vercel.app`

## 2. CORS on Render (required)

In the API service → **Environment** → update **`CORS_ORIGINS`** to include the new origin(s), for example:

```text
http://localhost:5173,http://localhost:3000,https://frontend-snowy-two-50.vercel.app,https://mercygold.co.ke,https://www.mercygold.co.ke,https://mercy-gold-next.vercel.app
```

If Vercel also issues `*.vercel.app` preview URLs, either:

- Add each preview URL you use, or  
- Temporarily test from the stable project domain only.

Save so Render redeploys.

## 3. Do not change the production domain yet

Keep **`mercygold.co.ke`** pointed at the **Vite** Vercel project until Next is feature-complete.

When ready to cut over:

1. Point the domain at the Next project, **or** change the existing project’s Root Directory to `frontend-next` and Production Branch to `main` after merging.
2. Confirm `NEXT_PUBLIC_API_URL` and CORS again.
3. Smoke-test login, cart, checkout (cookies need `SameSite=None; Secure` — already configured for production).

## 4. Local check before relying on preview

```bash
cd frontend-next
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://honey-shop-260z.onrender.com
npm install
npm run build && npm run start
```
