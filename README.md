# Braise: showcase site for a restaurant (demo)

**Braise** is a fictional wood-fire seasonal restaurant in Lille. The site is a portfolio demo: a menu filterable by diet, price and allergen, real-time table booking, a gallery, reviews and contact.

The brief is in [brief-site-restaurant.md](./brief-site-restaurant.md), the product in [PRODUCT.md](./PRODUCT.md) and the design system in [DESIGN.md](./DESIGN.md).

## Stack

- **Next.js 15** (App Router) + **Tailwind CSS 4**
- **PostgreSQL** via **Prisma**: hosted on Neon in production, Docker locally (optional)
- Icons: Phosphor. Fonts: Gilda Display + Hanken Grotesk.
- Hosting: **Vercel**. A `Dockerfile` remains available for self-hosting.

## Local development

```bash
pnpm install
cp .env.example .env        # then fill in DATABASE_URL and DATABASE_URL_UNPOOLED
pnpm db:push                # creates the tables
pnpm db:seed                # demo dishes and slots
pnpm dev                    # http://localhost:3000
```

There are two ways to get a database locally:

- **Docker**: run `docker compose up -d db`. The URLs in `.env.example` point to it.
- **Neon**: paste the URLs of a Neon database (or its `dev` branch) into `.env`. No Docker needed.

## Deploying (Vercel + Neon)

1. Import the project into Vercel. The framework (Next.js) and pnpm are detected automatically.
2. In the Vercel project, go to **Storage**, create a **Neon** database and connect it to the project. Vercel adds `DATABASE_URL` (pooled connection) and `DATABASE_URL_UNPOOLED` (direct connection) itself.
3. Initialise the database once, from your machine, using the Neon URLs:
   ```powershell
   $env:DATABASE_URL="postgresql://…-pooler…"
   $env:DATABASE_URL_UNPOOLED="postgresql://…"
   pnpm db:push
   pnpm db:seed
   ```
4. Redeploy.

The functions run in `fra1` (Frankfurt; see `vercel.json`). Create the Neon database in the same region (`aws-eu-central-1`).

### Booking slots

You never need to rerun the seed. `/api/creneaux` creates a day's slots the first time that day is viewed, based on the opening hours in `lib/restaurant.ts`. Bookings are open over 30 rolling days, at Lille time. Slots that have already passed today are no longer offered.

## Self-hosting (Docker)

```bash
docker compose up --build   # Next.js app (standalone) + Postgres 16
```

Then run `pnpm db:push` and `pnpm db:seed` once against the container's database.

## Scripts

| Command | Effect |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build (including `prisma generate`) and server |
| `pnpm db:push` | Syncs the Prisma schema with the database |
| `pnpm db:seed` | Resets the dishes and the next 30 days of slots |

## Content

Restaurant, address, reviews and rating are fictional. The photos come from free photo banks (Unsplash and Pexels); their provenance is in [design-audit/photos.md](./design-audit/photos.md). The design audit and the before/after of the redesign are in [design-audit/](./design-audit/).
