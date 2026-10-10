# Mercy Gold Honey — Frontend Complete Guide

**Brand:** Mercy Gold Honey  
**Scope of this document:** Customer storefront and admin **frontends only** (Vite production app + Next.js WIP).  
**Out of scope:** API / database / backend implementation details (the separate FastAPI service).

This guide explains everything built on the frontend so far, and what must carry into the **Next.js production** cutover.

---

## 1. Two frontends in the monorepo

```text
honey-shop/
├── frontend/          # Production today (React + Vite + React Router)
├── frontend-next/     # Next.js App Router storefront (SEO + cutover target)
├── vercel.json        # Production Vercel build still points at frontend/
└── …
```

| App | Path | Stack | Role today |
|-----|------|--------|------------|
| **Vite storefront + admin** | `frontend/` | React 19, Vite, React Router | **Live production** (e.g. `mercygold.co.ke`) |
| **Next storefront** | `frontend-next/` | Next.js 15 App Router | **WIP / preview** (e.g. `https://honey-shop-chi.vercel.app`) |

Until cutover:

- **`main` / production Vercel** builds **`frontend/`** only.
- **`dev`** holds Next work; a **second** Vercel project can use Root Directory `frontend-next` and branch `dev`.

---

## 2. Brand & design system

Shared visual language (especially aligned in Next globals):

| Token | Value / role |
|--------|----------------|
| Primary gold | `#b7791f` |
| Primary dark | `#8c5a16` |
| Background | Warm cream `#fffdf8` |
| Surface | White cards, soft borders `#e8dfd2` |
| Text | Dark brown `#2d241f`, muted `#6b625c` |
| Radii / shadows | Soft cards, hover lift on product tiles |

**Logo:** `mercy-gold-logo.jpg` (header; large, logo-only — brand name is inside the image).  
**Fallback product image:** `/honeyjar.jpg` when API paths still point at old `/src/assets/…` paths.

Copy themes: “Pure. Natural. Kenyan.”, hive-to-doorstep messaging, featured honey sections.

---

## 3. Production Vite app (`frontend/`)

### 3.1 Stack

- React 19 + Vite  
- React Router (`BrowserRouter`)  
- Context: **Auth**, **Cart**  
- `fetch` with **`credentials: 'include'`** (httpOnly cookie session)  
- Deploy: Vercel (`frontend/vercel.json` SPA rewrites → `index.html`)

### 3.2 Environment

```env
VITE_API_URL=https://honey-shop-260z.onrender.com
```

- No trailing slash  
- Set for Production (and Preview) on Vercel  
- Local default often `http://localhost:8000`

### 3.3 App shell

- `main.jsx` → `AuthProvider` → `CartProvider` → `App` → `AppRoutes`  
- **`PresenceHeartbeat`** pings the API while the tab is open (admin “online now”)  
- **Customer layout:** Navbar + main content (honeycomb-style background overlay)  
- **Admin layout:** Sidebar + header + protected routes  

### 3.4 Customer routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Hero + featured products from API |
| `/shop` | Shop | Full product list |
| `/product/:id` | Product details | Single product, add to cart |
| `/cart` | Cart | Quantities, remove, clear; refresh stock/price from API |
| `/checkout` | Checkout | Delivery form + place order (**guest allowed**) |
| `/login` | Login | Email/password + show/hide password |
| `/register` | Register | Name, email, phone, password + confirm |
| `/profile` | Profile | Account summary when logged in |
| `/orders` | My orders | Logged-in user’s orders |

### 3.5 Admin routes (`/admin/…`)

Gated by **`ProtectedAdminRoute`**:

1. Must be authenticated  
2. Must be `is_admin`  
3. Extra **inline password unlock** stored in `sessionStorage` (admin gate)

| Path | Page | Behavior |
|------|------|----------|
| `/admin` | Dashboard | Orders, revenue, products, customers, **online presence** |
| `/admin/products` | Products | List, search, soft-delete, link to add |
| `/admin/products/new` | Add product | Create product + Cloudinary image upload (admin) |
| `/admin/orders` | Orders | List + status updates |
| `/admin/customers` | Customers | Users from API |
| `/admin/inventory` | Inventory | Stock-oriented view |
| `/admin/payments` | Payments | UI (M-Pesa full flow still deferred) |
| `/admin/settings` | Settings | Store settings form ↔ API |

### 3.6 Auth (frontend behavior)

- Login / register / logout / me / refresh via auth service  
- Session in **httpOnly cookies** (not `localStorage` tokens)  
- `apiRequest` auto-**refresh** on 401 (once), then retry  
- Password fields: **eye toggle** show/hide on login & register  

### 3.7 Cart (frontend behavior)

- React context + **`localStorage`** key: `mercy_gold_cart_v1`  
- Survives refresh in the same browser  
- **`refreshCartFromServer`:** reloads each line from product API; removes inactive; clamps qty to stock  
- Cart page and checkout call refresh before trusting lines  
- Cleared after successful order  

### 3.8 Checkout & **Place order without login** (critical)

**Requirement for production (Vite already; Next must keep this):**

> The **Place order** button must work **even if the user is not logged in** (guest checkout).

#### What the UI does

1. User can open `/checkout` with items in the cart **without** logging in.  
2. Form fields: full name, phone, county, town/area, delivery address.  
3. If **logged in**, name and phone are **prefilled** from the account (read-only when already set).  
4. Guests see a note that ordering as guest is allowed; login/register is optional.  
5. Delivery fee is estimated from town via `deliveryZones` (client-side).  
6. **No online payment required** at this stage (“pay later” / M-Pesa later).  
7. On submit: refresh cart from API → `POST` order with line items + shipping fields → clear cart → success screen.  

#### What must **not** happen

- Do **not** redirect guests to `/login` only to place an order.  
- Do **not** disable **Place order** solely because `isAuthenticated` is false.  
- Do **not** require account creation before first purchase.  

Logged-in checkout remains supported (order can be linked to the user when a session exists).

### 3.9 Products UI

- List/normalize products (price as number, image URL fixes for legacy `/src/…` paths)  
- Featured section on home  
- Product cards: image, name, size, price, add to cart  

### 3.10 Presence (frontend)

- Heartbeat about every 30s while the tab is visible  
- Visitor id in `localStorage` (`mercy_gold_visitor_id`)  
- Admin dashboard shows near real-time “Online now” (guests vs logged-in)  

### 3.11 Payments UI note

- `MpesaPayment` component exists as a **stub / future** path  
- Current production path: **place order without paying first**  

### 3.12 Vite services (frontend-only view)

| Module | Role |
|--------|------|
| `api.js` | Base URL, credentials, refresh retry |
| `authService.js` | Login, register, logout, me |
| `productService.js` | List/get/create/update/delete products, image upload helper |
| `orderService.js` | Create order, list mine, admin list/update |
| `adminService.js` | Customers, store settings, presence |
| `deliveryService.js` | Town → delivery fee |
| `presenceService.js` | Heartbeat |

---

## 4. Next.js app (`frontend-next/`)

### 4.1 Goals

- **SEO:** server-rendered home, shop, product pages; metadata; `sitemap` + `robots`  
- **Parity:** same customer flows as Vite (cart, auth, **guest checkout**, orders, profile)  
- **Reuse:** same API base URL pattern (`NEXT_PUBLIC_API_URL`), same cart storage key, same delivery zones  

### 4.2 Stack

- Next.js 15 App Router  
- Server components for catalog pages  
- Client components for cart, auth, checkout  
- Providers: Auth + Cart in `components/Providers.js`  

### 4.3 Environment

```env
NEXT_PUBLIC_API_URL=https://honey-shop-260z.onrender.com
```

Local: `http://localhost:8000`  
CORS must allow the Next origin (e.g. `https://honey-shop-chi.vercel.app`, `http://localhost:3000`).

### 4.4 Routes

| Path | Rendering | Notes |
|------|-----------|--------|
| `/` | SSR | Hero + featured products |
| `/shop` | SSR | All products |
| `/products/[id]` | SSG/SSR | `generateStaticParams` + product metadata |
| `/cart` | Client | localStorage cart + refresh |
| `/checkout` | Client | **Guest place order required** |
| `/login`, `/register` | Client | Password eye toggles |
| `/orders`, `/profile` | Client | Auth-aware |
| `/robots.txt`, `/sitemap.xml` | Generated | SEO |

**Admin is not ported to Next** — remains on Vite until (if ever) needed.

### 4.5 Checkout on Next (must match production rule)

Implemented to mirror Vite:

- Header: “Almost There” / Checkout  
- Delivery details card + sticky order summary  
- Prefill when logged in  
- Guest messaging  
- Pay-later note  
- **Place order enabled without login**  

When finishing Next for production, **regression-test**:

1. Logged **out**, add to cart, checkout, fill address, **Place order** succeeds.  
2. Logged **in**, name/phone prefilled, place order succeeds.  
3. Empty cart shows empty state (no order).  

### 4.6 Deploy preview

See `frontend-next/VERCEL.md`:

- Separate Vercel project  
- Root Directory: `frontend-next`  
- Production branch for preview work: often `dev`  
- Env: `NEXT_PUBLIC_API_URL`  
- Do not point `mercygold.co.ke` at Next until cutover checklist is done  

---

## 5. Cross-cutting frontend rules

1. **API URL** is build-time (`VITE_*` or `NEXT_PUBLIC_*`).  
2. **Cookies:** all session calls use `credentials: 'include'`.  
3. **Cart key:** `mercy_gold_cart_v1` (shared idea across Vite and Next).  
4. **Images:** prefer Cloudinary HTTPS URLs from the API; fall back to `/honeyjar.jpg`.  
5. **Guest checkout is a product requirement**, not a temporary hack — keep it in Next production.  
6. **Admin password gate** is frontend UX on top of admin role checks.  
7. **M-Pesa** is last on the roadmap; UI may exist as stub only.  

---

## 6. Feature checklist (frontend)

| Feature | Vite (`frontend/`) | Next (`frontend-next/`) |
|---------|--------------------|-------------------------|
| Home / shop / product UI | Yes | Yes (SSR/SEO) |
| Add to cart | Yes | Yes |
| Cart persistence | Yes | Yes |
| Stock/price refresh in cart | Yes | Yes |
| Login / register / logout | Yes | Yes |
| Password show/hide | Yes | Yes |
| **Place order without login** | **Yes — keep** | **Yes — keep for production** |
| Checkout prefill when logged in | Yes | Yes |
| My orders / profile | Yes | Yes |
| Admin panel | Yes | No (Vite only) |
| Online presence heartbeat | Yes | Yes |
| Sitemap / robots | N/A (SPA) | Yes |
| M-Pesa real payments | Stub / later | Not primary |

---

## 7. Cutover notes (frontend → Next production)

When Next becomes the live site:

1. Confirm **guest Place order** works on the Next deployment end-to-end.  
2. Confirm login, cart persistence, and product SSR still work.  
3. Set Vercel root to `frontend-next` (or switch domain to the Next project).  
4. Keep env `NEXT_PUBLIC_API_URL` correct.  
5. Ensure browser origins used in production are allowed for credentialed requests.  
6. Admin can remain on the old Vite deploy temporarily, or stay linked under a subdomain if needed.  

---

## 8. Local commands (frontend only)

**Vite**

```bash
cd frontend
npm install
# .env → VITE_API_URL=…
npm run dev
```

**Next**

```bash
cd frontend-next
npm install
# .env.local → NEXT_PUBLIC_API_URL=…
npm run dev
```

---

## 9. Summary

The Mercy Gold Honey **frontend** is a dual-track setup: a full **Vite** customer + admin app in production, and a **Next.js** customer storefront built for SEO and eventual cutover. Shared product behaviors include cookie-based auth, persistent cart, delivery fee hints, presence heartbeats, and — critically — **the ability to place an order without logging in**. That guest **Place order** behavior is mandatory in the Next.js production version and must not be removed when finishing the migration.
