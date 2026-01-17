# Architecture Documentation

## Overview

Tally is a SaaS application for restaurant bill splitting built with Next.js 16 + React 19 + Supabase.

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | Next.js 15 (App Router)  |
| Landing    | Astro (Static)           |
| UI         | React 19 + TailwindCSS 4 |
| State      | Zustand + Immer          |
| Database   | Supabase (PostgreSQL)    |
| Auth       | Supabase Auth            |
| Payments   | Stripe                   |
| Forms      | React Hook Form + Zod    |
| Components | Radix UI + custom        |

## URL Architecture

See [ROUTING.md](./ROUTING.md) for the complete URL structure.

### Path-Based Routing

The app uses path-based routing (not subdomains) for simplicity:

| Path                | Purpose                       |
| ------------------- | ----------------------------- |
| `/`                 | App navigation hub            |
| `/register`         | New restaurant signup         |
| `/auth/callback`    | Supabase auth callback        |
| `/hub/admin/*`      | Admin dashboard (protected)   |
| `/hub/pos/*`        | Point of Sale (protected)     |
| `/hub/kds/*`        | Kitchen Display (protected)   |
| `/hub/onboarding/*` | Onboarding wizard (protected) |
| `/go/[slug]`        | Customer bill view (public)   |

### Domains

| Environment | App                | Landing          |
| ----------- | ------------------ | ---------------- |
| Development | `localhost:3000`   | `localhost:4321` |
| Production  | `app.paytally.app` | `paytally.app`   |

**Note**: Landing and app are separate deployments. Landing is a static Astro site, app is a Next.js server.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── go/[slug]/          # Customer flow (trust → bill → payment)
│   ├── hub/admin/          # Restaurant admin dashboard
│   ├── hub/pos/            # Point of Sale for staff
│   ├── hub/kds/            # Kitchen Display System
│   ├── hub/onboarding/     # Onboarding wizard
│   ├── auth/               # Auth callbacks
│   └── api/                # API Routes
├── components/            # React components by domain
│   ├── bill/              # Bill display & item selection
│   ├── layout/            # App layout components
│   ├── payment/           # Payment flow components
│   ├── providers/         # React context providers
│   ├── shared/            # Generic shared components
│   ├── trust/             # QR scan trust screen
│   ├── ui/                # Base UI primitives
│   └── waiting/           # Waiting room components
├── lib/                   # Utilities and configs
│   ├── api/               # API helpers and validation
│   ├── hooks/             # Custom React hooks
│   ├── supabase/          # Supabase clients
│   └── utils/             # General utilities
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
apps/
└── landing/               # Astro marketing site (separate build)
    ├── src/
    │   ├── components/    # Astro/HTML components
    │   ├── layouts/       # Page layouts with GSAP animations
    │   ├── pages/         # File-based routing
    │   └── styles/        # Global CSS + design tokens
    └── public/            # Static assets
```

## Data Flow

### Customer Flow

```
QR Scan → Trust Screen → Bill View → Select Items → Payment → Success
   |           |             |           |            |
   ↓           ↓             ↓           ↓            ↓
/go/[slug]  /go/[slug]   /go/[slug]/bill  /go/[slug]/waiting  /go/[slug]/payment
```

### State Management

```
┌─────────────────┐     ┌─────────────────┐
│   SessionStore  │     │     UIStore     │
│  (session data) │     │  (modals, theme)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    BillStore    │     │ParticipantStore │
│  (order items)  │     │(user selections)│
└─────────────────┘     └─────────────────┘
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for full schema.

### Key Tables

- `restaurants` - Restaurant configs
- `users` - Staff accounts
- `tables` - Restaurant tables
- `categories` / `products` - Menu
- `orders` / `order_items` - Orders
- `payment_sessions` / `payments` - Payments

### RLS Policies

- Public read for active restaurants, menus, tables
- Service role bypass for API routes
- Session-based access for payments

## Security

### Authentication Layers

1. **Middleware** (`middleware.ts`) - Session refresh & route protection for `/hub/*`
2. **API Validation** - Zod schemas validate all inputs
3. **RLS Policies** - Database-level access control
4. **Service Role** - Used only in server-side API routes

### Auth Flow

1. User registers at `/register` → Supabase sends confirmation email
2. User clicks link → `/auth/callback?code=xxx`
3. Callback exchanges code for session → redirects to `/hub/onboarding`
4. Middleware refreshes session on every request

### Best Practices

- Use `getUser()` not `getSession()` for auth checks
- Validate all inputs with Zod
- Don't trust client-side auth alone
- Log errors without exposing internals
- All auth redirects go through `/auth/callback`

## Deployment

### Monorepo Structure

The project uses pnpm workspaces with two separate applications:

1. **Next.js App** (`src/`): Main SaaS application
2. **Astro Landing** (`apps/landing/`): Marketing website

### Deployment Strategy

**Landing Site (Astro)**:

- **Build**: `pnpm build:landing` → Static HTML/CSS/JS output to `apps/landing/dist/`
- **Domain**: `paytally.app` (production) / `localhost:4321` (dev)
- **Hosting**: Static hosting (Vercel, Netlify, Cloudflare Pages, etc.)
- **Dependencies**: None on main app - fully independent

**Main App (Next.js)**:

- **Build**: `pnpm build` → Next.js server build
- **Domain**: `app.paytally.app` (production) / `localhost:3000` (dev)
- **Hosting**: Vercel, Node.js server, or Docker container
- **Environment Variables**: Requires Supabase keys, Stripe keys, etc. (see `.env.example`)

### Environment Variables

**Landing** (`apps/landing/.env`):

```bash
PUBLIC_APP_URL=https://app.paytally.app  # Link to main app
```

**Main App** (`.env`):

```bash
NEXT_PUBLIC_LANDING_URL=https://paytally.app  # Link to landing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
# ... (see .env.example for full list)
```

### Build Commands

```bash
# Development
pnpm dev              # Start Next.js app
pnpm dev:landing      # Start Astro landing

# Production builds
pnpm build            # Build Next.js app
pnpm build:landing    # Build Astro landing

# Preview production builds locally
pnpm start            # Preview Next.js build
pnpm preview:landing  # Preview Astro build
```

### Deployment Checklist

- [ ] Configure environment variables for both deployments
- [ ] Set up custom domains (`paytally.app` and `app.paytally.app`)
- [ ] Deploy landing site to static hosting
- [ ] Deploy main app to serverless/Node.js hosting
- [ ] Test cross-linking between landing and app
- [ ] Configure Supabase production instance
- [ ] Set up Stripe webhooks pointing to production API
