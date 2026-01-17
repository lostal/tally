# Project Structure

This document explains the organization of the Tally codebase.

## Root Directory

- **`apps/`**: Monorepo applications (landing site).
- **`src/`**: Next.js application source code.
- **`supabase/`**: Local Supabase configuration and migrations.
- **`public/`**: Static assets (favicons, images).
- **`docs/`**: Project documentation (this folder).
- **`next.config.ts`**: Next.js configuration.
- **`package.json`**: Dependencies and scripts.
- **`pnpm-workspace.yaml`**: Monorepo workspace configuration.

## Applications (`apps/`)

### `landing/` (Astro Static Site)

Marketing website built with Astro for optimal performance.

- **`src/components/`**: Reusable Astro components (Marquee, etc.).
- **`src/layouts/`**: Base page layouts with animations and scripts.
- **`src/pages/`**: File-based routing (currently single-page: `index.astro`).
- **`src/styles/`**: Global CSS with design tokens (OKLCH colors, typography scale).
- **`public/`**: Static assets (favicon, images).
- **`astro.config.mjs`**: Astro configuration (sitemap, Tailwind integration).

**Tech Stack**: Astro 5, Tailwind CSS v4, GSAP animations, Lenis smooth scroll.

**Deployment**: Static HTML/CSS/JS, separate from main Next.js app.

## Source Code (`src/`)

### `app/` (Next.js App Router)

The core routing logic, separated by domain.

- **`go/`**: Customer-facing application.
  - `[slug]/`: Dynamic route for restaurant slug (QR flow).
- **`hub/`**: Admin and POS interfaces (protected routes).
  - `admin/`: Management dashboard.
  - `pos/`: Point of Sale interface.
  - `kds/`: Kitchen Display System.
  - `onboarding/`: Onboarding wizard.
- **`auth/`**: Auth callbacks.
- **`api/`**: Backend API routes.
  - `stripe/`: Webhook handlers.
  - `orders/`, `session/`: Core business logic endpoints.

### `components/`

React components organized by functional domain.

- **`ui/`**: Reusable primitive components (buttons, inputs, dialogs) - mostly shadcn/ui.
- **`bill/`**: Components related to displaying and interacting with the bill.
- **`payment/`**: Payment processing forms and status displays.
- **`pos/`**: Components specific to the Point of Sale interface.
- **`providers/`**: Context providers (Theme, Realtime, Toast).
- **`layout/`**: Structural components (Sidebar, Headers).
- **`shared/`**: Generic components used across multiple domains.

### `lib/`

Utilities, helpers, and configuration.

- **`supabase/`**: Database clients.
  - `client.ts`: Browser client.
  - `server.ts`: Server-side client (for server components/actions).
  - `middleware.ts`: Auth helper.
- **`hooks/`**: Custom React hooks (e.g., `use-debounce`, `use-click-outside`).
- **`utils/`**: General helper functions (`cn`, formatting).
- **`theme/`**: Theme configuration and style utilities.

### `types/`

TypeScript definitions.

- **`database.ts`**: Auto-generated Supabase database types.
- `index.ts`: Shared application types.

### `stores/`

Global state management (Zustand).

- `session-store.ts`: Manages the current payment session state.
- `cart-store.ts`: Manages local selections.
