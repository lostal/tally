# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tally is a multi-tenant B2B SaaS for the hospitality industry. It provides:
- **Customer App** (`go.paytally.app`): QR-based bill splitting for diners
- **Admin Dashboard** (`hub.paytally.app/admin`): Restaurant management
- **POS** (`hub.paytally.app/pos`): Point of Sale for staff

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev              # Start Next.js dev server (Turbopack)
pnpm dev:webpack      # Start with Webpack instead

# Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm format           # Format with Prettier

# Testing
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Run tests once (CI)
pnpm test:coverage    # Run with coverage report

# Database (Supabase Local)
pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
pnpm supabase:reset   # Reset database (runs migrations)
```

## Architecture

### Multi-Tenant Subdomain Routing

The app uses subdomain-based routing handled by `middleware.ts`:
- `hub.localhost:3000` → rewrites to `/hub/*` routes
- `go.localhost:3000` → rewrites to `/go/*` routes
- `localhost:3000` → marketing site (root)

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── go/[slug]/          # Customer flow (trust → bill → payment)
│   ├── hub/admin/          # Restaurant admin dashboard
│   ├── hub/pos/            # Point of Sale for staff
│   ├── api/                # API Routes
│   └── actions/            # Server Actions
├── components/             # React components by domain
│   ├── ui/                 # shadcn/ui primitives
│   ├── bill/               # Bill display & item selection
│   ├── payment/            # Payment flow components
│   ├── pos/                # POS-specific components
│   └── providers/          # Context providers
├── lib/                    # Utilities and configuration
│   ├── supabase/           # Supabase clients (client.ts, server.ts)
│   ├── api/                # API helpers and Zod validation
│   └── hooks/              # Custom React hooks
├── stores/                 # Zustand stores
│   ├── session-store.ts    # Payment session state
│   ├── participant-store.ts # User selections
│   └── bill-store.ts       # Order items state
└── types/                  # TypeScript definitions
    └── database.ts         # Auto-generated Supabase types
```

### State Management

Uses Zustand + Immer for global state. Key stores:
- `session-store`: Current payment session data
- `participant-store`: User's item selections and claims
- `bill-store`: Order and bill data

### Database

Supabase PostgreSQL with Row Level Security (RLS). Key tables:
- `restaurants`, `tables`, `categories`, `products` (multi-tenant config)
- `orders`, `order_items` (order management)
- `sessions`, `participants` (bill splitting with optimistic locking)
- `payment_sessions`, `payments` (payment tracking)

Database types are auto-generated in `src/types/database.ts`.

### API Pattern

API routes use Zod validation via `@/lib/api/validation`:

```typescript
import { validateBody, unauthorized } from '@/lib/api/validation';
import { verifyApiAuth } from '@/lib/supabase/middleware';

const Schema = z.object({ restaurantId: z.string().uuid() });

export async function POST(request: Request) {
  const { user, supabase, error } = await verifyApiAuth(request);
  if (!user) return unauthorized();

  const { data, error: validationError } = await validateBody(request, Schema);
  if (validationError) return validationError;
  // ...
}
```

### Security Layers

1. **Middleware** (`middleware.ts`): Subdomain routing
2. **API Validation**: Zod schemas on all inputs
3. **RLS Policies**: Database-level tenant isolation
4. **Auth**: Use `getUser()` not `getSession()` for server-side auth checks

## Code Conventions

- **Imports**: Use absolute imports (`@/components/...`)
- **Naming**: Components `PascalCase.tsx`, utilities `kebab-case.ts`
- **Forms**: React Hook Form + Zod for validation
- **Styling**: Tailwind CSS v4 with design tokens in `globals.css`
- **Testing**: Tests in `src/__tests__/` or colocated as `*.test.ts`

## Documentation

Detailed documentation in `docs/`:
- `ARCHITECTURE.md`: System architecture
- `DATABASE_SCHEMA.md`: Full database schema
- `API.md`: API endpoints and patterns
- `USER_FLOWS.md`: Customer and admin workflows
- `DESIGN_SYSTEM.md`: UI/UX guidelines

**Important**: Keep `docs/*.md` in sync when making architectural changes.
