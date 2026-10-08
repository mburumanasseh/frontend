# Mercy Gold Honey — Next.js storefront (WIP)

Parallel frontend for SEO (App Router, server-rendered product pages).  
**Production still uses `../frontend` (Vite)** until cutover.

## Stack

- Next.js 15 (App Router)
- Same FastAPI backend as the Vite app

## Setup

```bash
cd frontend-next
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open http://localhost:3000

## Deploy note

Do **not** point production `mercygold.co.ke` here until the app is feature-complete.  
Use a Vercel **Preview** project or the `dev` branch for testing.

## CORS

Render `CORS_ORIGINS` must include any preview URL you use, plus:

`https://mercygold.co.ke`, `https://www.mercygold.co.ke`
