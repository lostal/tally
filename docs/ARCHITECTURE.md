# Architecture Documentation

## Overview

Tally is a SaaS application for restaurant bill splitting built with Next.js 16 + React 19 + Supabase.

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | Next.js 16 (App Router)  |
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
