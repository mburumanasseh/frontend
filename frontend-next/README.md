# Mercy Gold Honey — Next.js storefront (WIP)

Parallel to production Vite app in `../frontend`. Develop on branch **`dev`**.

## Features (this scaffold)

| Area | Status |
|------|--------|
| Home / Shop / Product (SSR + metadata) | ✅ |
| Cart (`localStorage` + stock refresh) | ✅ |
| Login / Register (httpOnly cookies + eye toggle) | ✅ |
| Checkout (prefill name/phone, pay later) | ✅ |
| Orders / Profile | ✅ |
| Admin panel | ❌ still on Vite `frontend/` |

## Setup

```bash
cd frontend-next
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://honey-shop-260z.onrender.com
npm install
npm run dev
```

## Production cutover (later)

1. Feature-complete + tested on `dev`
2. Point Vercel at `frontend-next`
3. Keep CORS origins updated on Render
