# Mercy Gold Honey — Backend

FastAPI API for the Mercy Gold Honey monorepo.

## Stack

| Piece | Choice |
|-------|--------|
| Framework | FastAPI |
| DB | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Auth | JWT access + refresh tokens in **httpOnly cookies** |
| Password hashing | passlib + bcrypt 4.0.1 |
| Images | Cloudinary |
| Email | Resend **or** SMTP |
| Tests | pytest + httpx + in-memory SQLite |
| Deploy | Render |

## Project layout

```text
backend/
├── app/
│   ├── main.py              # FastAPI app + CORS + routers
│   ├── api/                 # Route modules
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── orders.py
│   │   ├── uploads.py
│   │   ├── customers.py     # Admin customer list
│   │   ├── settings.py      # Admin store settings
│   │   ├── health.py
│   │   └── deps.py          # get_current_user / admin
│   ├── core/                # config, security
│   ├── db/                  # session, Base
│   ├── models/              # User, Product, Order, StoreSettings
│   ├── schemas/             # Pydantic
│   └── services/            # cloudinary, email
├── alembic/versions/        # 001–005
├── tests/
├── requirements.txt
├── requirements-dev.txt
├── runtime.txt              # Python 3.12
├── docker-compose.yml       # Local Postgres
└── .env.example
```

## Local setup

### 1. PostgreSQL

```bash
docker compose up -d
# or use any Postgres and set DATABASE_URL
```

### 2. Virtualenv + deps

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment

```bash
cp .env.example .env
```

Important variables (values are secrets — never commit them):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `SECRET_KEY` | JWT signing |
| `CORS_ORIGINS` | Comma-separated origins (Vercel URL + `http://localhost:5173`) |
| `DEBUG` | `true` locally; `false` in production (`SameSite=None` cookies when false) |
| `BOOTSTRAP_SECRET` | One-time promote user → admin |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` / `FOLDER` | Image uploads |
| `RESEND_API_KEY` + `EMAIL_FROM` | Welcome email (or SMTP_*) |

### 4. Migrations

```bash
alembic upgrade head
```

Migrations:

| Rev | Change |
|-----|--------|
| 001 | users |
| 002 | products |
| 003 | orders + order_items |
| 004 | wider product `image_url` |
| 005 | store_settings |

### 5. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API root: http://localhost:8000  
- Swagger: http://localhost:8000/api/v1/docs  
- Health: http://localhost:8000/api/v1/health  

## API overview

Prefix: `/api/v1`

### Health
| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | No |

### Auth
| Method | Path | Auth | Notes |
|--------|------|------|------|
| POST | `/auth/register` | No | Sets cookies; queues welcome email |
| POST | `/auth/login` | No | Sets cookies |
| POST | `/auth/logout` | Cookie | Clears cookies |
| GET | `/auth/me` | Cookie | Current user |
| POST | `/auth/refresh` | Refresh cookie | New access token |
| POST | `/auth/bootstrap-admin` | Body secret | Promote existing user to admin |

### Products
| Method | Path | Auth |
|--------|------|------|
| GET | `/products` | No (active only; `include_inactive=true` for admin UIs) |
| GET | `/products/{id}` | No |
| POST | `/products` | Admin |
| PATCH | `/products/{id}` | Admin |
| DELETE | `/products/{id}` | Admin (soft-delete) |

### Orders
| Method | Path | Auth |
|--------|------|------|
| POST | `/orders` | Logged-in user |
| GET | `/orders` | Own orders |
| GET | `/orders/{id}` | Owner or admin |
| GET | `/admin/orders` | Admin |
| PATCH | `/admin/orders/{id}` | Admin (status) |

### Uploads
| Method | Path | Auth |
|--------|------|------|
| POST | `/uploads/image` | Admin | multipart file → Cloudinary URL |

### Admin customers & settings
| Method | Path | Auth |
|--------|------|------|
| GET | `/admin/customers` | Admin |
| GET | `/admin/settings` | Admin |
| PATCH | `/admin/settings` | Admin |

## Auth behaviour

- **Access token** cookie: short-lived (~15 min), path `/`
- **Refresh token** cookie: longer-lived, path `/api/v1/auth`
- Production: `Secure` + `SameSite=None` (cross-site Vercel → Render)
- Local `DEBUG=true`: `SameSite=Lax`
- Frontend should send `credentials: 'include'`

### Bootstrap admin

1. Register a user  
2. `POST /api/v1/auth/bootstrap-admin` with `{ "email": "...", "secret": "<BOOTSTRAP_SECRET>" }`  
3. Login again  

## Tests

```bash
pip install -r requirements-dev.txt
PYTHONPATH=. pytest
# coverage:
pytest --cov=app --cov-report=term-missing
```

Uses in-memory SQLite; no Docker required for tests.

## Render deployment

- **Root Directory:** `backend`
- **Build:** `pip install -r requirements.txt`
- **Start:** `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Python 3.12** via `runtime.txt`
- Set all env vars in the Render dashboard (never in git)
- Free tier cold starts: external ping to `/api/v1/health` every 5–10 minutes

## Not implemented yet

- M-Pesa Daraja STK push / callbacks  
- Order confirmation emails  
- Public storefront reading settings for branding (settings are admin-persisted only)

## Related

- Frontend: [../frontend](../frontend)  
- Monorepo root: [../README.md](../README.md)


## Seed first admin user

```bash
export SEED_ADMIN_EMAIL=you@example.com
export SEED_ADMIN_PASSWORD='your-secure-password'
export SEED_ADMIN_NAME='Your Name'
python seed_admin_user.py
```

Or register via `POST /api/v1/auth/register`, then promote with `POST /api/v1/auth/bootstrap-admin` using `BOOTSTRAP_SECRET`.
