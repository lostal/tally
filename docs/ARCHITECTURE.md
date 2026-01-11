# Architecture Documentation

## Overview

Tally is a SaaS application for restaurant bill splitting built with Next.js 16 + React 19 + Supabase.

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | Next.js 16 (App Router)  |
| UI         | React 19 + TailwindCSS 4 |
| State      | Zustand + Immer          |
| Database   | Supabase (PostgreSQL)    |
| Auth       | Supabase Auth            |
| Payments   | Stripe (planned)         |
| Forms      | React Hook Form + Zod    |
| Components | Radix UI + custom        |

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Public landing pages
│   ├── [slug]/            # Customer flow (trust → bill → payment)
│   ├── admin/             # Restaurant admin panel
│   ├── pos/               # Point of Sale for staff
│   └── api/               # API Routes
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
```

## Data Flow

### Customer Flow

```
QR Scan → Trust Screen → Bill View → Select Items → Payment → Success
   |           |             |           |            |
   ↓           ↓             ↓           ↓            ↓
/[slug]    /[slug]      /[slug]/bill  /[slug]/waiting  /[slug]/payment
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

1. **Proxy (src/proxy.ts)** - Protects `/admin/*` and `/pos/*` routes
2. **API Validation** - Zod schemas validate all inputs
3. **RLS Policies** - Database-level access control
4. **Service Role** - Used only in server-side API routes

### Best Practices

- Use `getUser()` not `getSession()` for auth checks
- Validate all inputs with Zod
- Don't trust client-side auth alone
- Log errors without exposing internals
