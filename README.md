# Mercy Gold Honey

Monorepo for **Mercy Gold Honey** — a Kenyan honey e-commerce platform.

| Layer | Stack | Hosting |
|-------|--------|---------|
| **Frontend** | React 19 + Vite | [Vercel](https://frontend-snowy-two-50.vercel.app, https://mercygold.co.ke) |
| **Backend** | FastAPI + SQLAlchemy + Alembic | [Render](https://honey-shop-260z.onrender.com) |
| **Database** | PostgreSQL | Render Postgres |
| **Images** | Cloudinary | Cloudinary |
| **Auth** | JWT in httpOnly cookies | — |
| **Payments** | M-Pesa Daraja | *Not integrated yet* |

## Repository structure

```text
honey-shop/
├── frontend/          # Customer storefront + admin panel
├── backend/           # REST API
├── vercel.json        # Vercel monorepo build + SPA rewrites
├── package.json       # Root metadata
└── .trackers/         # Engineer Mode task state
```

## Live URLs

| Service | URL |
|---------|-----|
| Storefront | https://frontend-snowy-two-50.vercel.app, https://mercygold.co.ke |
| API | https://honey-shop-260z.onrender.com |
| API docs | https://honey-shop-260z.onrender.com/api/v1/docs |
| Health | https://honey-shop-260z.onrender.com/api/v1/health |

## Features (current)

### Customer
- Browse products (shop + featured)
- Cart (browser-side until checkout)
- Register / login / logout
- Profile page
- Order history
- Checkout creates a real order (logged-in users only)
- Welcome email on register (when email is configured)

### Admin (`/admin` — password gate + `is_admin`)
- Dashboard (live stats: orders, revenue, products, customers)
- Products (list, soft-delete, add with Cloudinary upload)
- Orders (list + status updates)
- Customers (registered users + spend)
- Inventory (stock edit)
- Payments view (from order status; pre–M-Pesa)
- Store settings (persisted in DB)

### Backend API
- Auth with access + refresh httpOnly cookies (`SameSite=None` in production)
- Products CRUD
- Orders + admin order management
- Image upload to Cloudinary
- Admin customers + store settings
- Pytest suite (SQLite in-memory)

## Local development

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # if present; or create .env
# VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173

### Backend

See [backend/README.md](./backend/README.md) for Postgres, migrations, and env vars.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Docs: http://localhost:8000/api/v1/docs

### Tests (backend)

```bash
cd backend
pip install -r requirements-dev.txt
PYTHONPATH=. pytest
```

## Deployment notes

### Vercel (frontend)
- Root build uses `vercel.json` (`frontend` install/build, SPA rewrites)
- **Required env:** `VITE_API_URL=https://honey-shop-260z.onrender.com` for **Production** (and Preview)
- Redeploy after changing `VITE_*` vars (baked at build time)

### Render (backend)
- **Root Directory:** `backend` (or monorepo path as configured)
- **Start command (recommended):**
  ```bash
  alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Python:** 3.12 (`runtime.txt`)
- Free tier may sleep; use an external health ping every 5–10 minutes on `/api/v1/health`

### Environment variables (names only — no secrets in git)

Backend (Render): `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `DEBUG`, `BOOTSTRAP_SECRET`, `CLOUDINARY_*`, `EMAIL_FROM`, `RESEND_API_KEY` or `SMTP_*`

Frontend (Vercel): `VITE_API_URL`

## Engineering

This repo follows Engineer Mode (topic branches + PRs). See `.trackers/` when present.

## Still planned
- M-Pesa Daraja STK push + callbacks
- Order confirmation emails
- Custom domain
- Frontend automated tests
