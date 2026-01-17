# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tally is a multi-tenant B2B SaaS for the hospitality industry. It provides:

- **Customer App** (`/go/*`): QR-based bill splitting for diners
- **Admin Dashboard** (`/hub/admin/*`): Restaurant management
- **POS** (`/hub/pos/*`): Point of Sale for staff
- **Landing** (`apps/landing`): Marketing site (Astro)

## Commands

```bash
# Setup
pnpm install          # Install dependencies (root + workspaces)

# Development (Local)
pnpm dev              # Start Next.js dev server (Turbopack)
pnpm dev:landing      # Start Astro landing dev server (port 4321)
pnpm dev:all          # ⭐ Start BOTH projects simultaneously

# Build & Preview
pnpm build            # Build Next.js app for production
pnpm build:landing    # Build Astro landing (static output)
pnpm build:all        # Build both projects
pnpm start            # Preview Next.js production build
pnpm preview:landing  # Preview Astro production build locally

# Quality - Next.js
pnpm lint             # Run ESLint on Next.js app
pnpm type-check       # TypeScript type checking (Next.js)
pnpm format           # Format Next.js files with Prettier

# Quality - Landing
pnpm lint:landing     # Run ESLint on Astro landing
pnpm type-check:landing # TypeScript type checking (Astro)
pnpm format:landing   # Format Astro files with Prettier

# Quality - All Projects
pnpm lint:all         # Lint both projects
pnpm type-check:all   # Type-check both projects
pnpm format:all       # Format all files in both projects

# Testing
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Run tests once (CI)
pnpm test:coverage    # Run with coverage report

# Database (Supabase Local)
pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
pnpm supabase:reset   # Reset database (runs migrations)
```

## Local Development Setup

Para ejecutar la aplicación completa localmente (landing + app):

1. **Instala dependencias**:

   ```bash
   pnpm install
   ```

2. **Configura variables de entorno**:
   - `.env.local` → URLs locales para Next.js (ya configurado)
   - `apps/landing/.env` → URL local para Astro (ya configurado)

3. **Ejecuta ambos proyectos**:

   ```bash
   pnpm dev:all
   ```

   Esto iniciará:
   - Next.js app en `http://localhost:3000`
   - Astro landing en `http://localhost:4321`

4. **Prueba la comunicación**:
   - Desde la landing (`localhost:4321`), los links deben apuntar a `localhost:3000`
   - Desde la app (`localhost:3000`), los links a la landing deben apuntar a `localhost:4321`

## Architecture

### URL Routing (Path-Based)

The app uses path-based routing (see `docs/ROUTING.md`):

- `/hub/admin/*` → Admin dashboard (requires auth)
- `/hub/pos/*` → Point of Sale (requires auth)
- `/hub/kds/*` → Kitchen Display (requires auth)
- `/go/[slug]` → Customer bill view (public via QR)
- `/auth/callback` → Supabase auth callback
- `/register` → New restaurant signup

Middleware (`middleware.ts`) handles:

1. Session refresh on every request
2. Auth protection for `/hub/*` routes
3. Redirect to login if unauthenticated

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── go/[slug]/          # Customer flow (trust → bill → payment)
│   ├── hub/admin/          # Restaurant admin dashboard
│   ├── hub/pos/            # Point of Sale for staff
│   ├── hub/onboarding/     # Onboarding wizard
│   ├── auth/               # Auth callbacks
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
apps/
└── landing/                # Astro marketing site (separate build)
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

1. **Middleware** (`middleware.ts`): Auth protection & session refresh
2. **API Validation**: Zod schemas on all inputs
3. **RLS Policies**: Database-level tenant isolation
4. **Auth**: Use `getUser()` not `getSession()` for server-side auth checks

## Code Conventions

- **Imports**: Use absolute imports (`@/components/...`)
- **Naming**: Components `PascalCase.tsx`, utilities `kebab-case.ts`
- **Forms**: React Hook Form + Zod for validation
- **Styling**: Tailwind CSS v4 with design tokens in `globals.css`
- **Testing**: Tests in `src/__tests__/` or colocated as `*.test.ts`

## Deployment

### Platforms

- **Next.js App**: Deployed to **Vercel** (`vercel.json` configured)
  - Production URL: `https://app.paytally.app`
  - Automatic deployments from `main` branch

- **Astro Landing**: Deployed to **Cloudflare Pages** (see `apps/landing/CLOUDFLARE_DEPLOYMENT.md`)
  - Production URL: `https://paytally.app`
  - Static site with global CDN

### Environment Variables

**Production** (`.env`):

- Contains production URLs and API keys
- Never commit this file

**Development** (`.env.local`):

- Contains local URLs (`localhost:3000`, `localhost:4321`)
- Git-ignored, safe for development

### Deployment Workflow

1. **Push to `main`** → Automatic deployment to both platforms
2. **Pull Request** → Preview deployments generated
3. **Rollback** → Available through platform dashboards

See `docs/ARCHITECTURE.md` for detailed deployment configuration.

## Documentation

Detailed documentation in `docs/`:

- `ARCHITECTURE.md`: System architecture + deployment
- `LANDING.md`: Landing page documentation (Astro)
- `DATABASE_SCHEMA.md`: Full database schema
- `API.md`: API endpoints and patterns
- `USER_FLOWS.md`: Customer and admin workflows
- `DESIGN_SYSTEM.md`: UI/UX guidelines

**Important**: Keep `docs/*.md` in sync when making architectural changes.
