# AGENTS.md

> **Purpose**: This file provides context and instructions for AI agents working on the Tally codebase. Use the linked documentation files for deep dives into specific domains.
>
> **⚠️ CRITICAL**: If your code changes affect architecture, schema, API, or workflows, you **MUST** update the corresponding documentation (`docs/*.md`) immediately. Keep the docs in sync with the code at all times.

## 1. Project Overview

Tally is a multi-tenant B2B SaaS for the hospitality industry, providing a "Split the Bill" experience (Customer App), a Point of Sale (POS), and an Admin Dashboard.

- **Architecture Context**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **URL Routing**: [docs/ROUTING.md](docs/ROUTING.md)
- **Business Logic**: [docs/BUSINESS_MODEL.md](docs/BUSINESS_MODEL.md)
- **User Flows**: [docs/USER_FLOWS.md](docs/USER_FLOWS.md)

## 2. Setup & Development Environment

### Installation & Run

```bash
pnpm install
pnpm dev              # Starts Next.js app (localhost:3000)
pnpm dev:landing      # Starts Astro landing (localhost:4321)
pnpm build            # Production build
```

### Database (Supabase Cloud)

## 3. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Shadcn/UI, Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand + Immer
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest

## 4. Project Structure

For a detailed file tree and explanation of directories, see:
👉 **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

## 5. Code Style & Conventions

- **Format**: Prettier (run `pnpm run format`).
- **Linting**: ESLint (run `pnpm run lint`).
- **Imports**: Use absolute imports (`@/components/...`) over relative (`../../`).
- **Naming**:
  - React Components: `PascalCase.tsx`
  - Utilities/Hooks: `kebab-case.ts`
  - Folders: `kebab-case`
- **Design System**: Follow the tokens and principles in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## 6. Testing & Validation

- **Unit/Integration**: Vitest
- **Commands**:
  ```bash
  pnpm run test         # Run all tests
  pnpm run test:run     # Run once (CI)
  pnpm run type-check   # TypeScript check
  ```

## 7. Data & API

- **Database Schema**: See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) and `src/types/database.ts` for exact types.
- **API Endpoints**: Key endpoints and validation logic are documented in [docs/API.md](docs/API.md).

## 8. Git & PR Workflow

- **Branches**: `feature/description` or `fix/issue-description`.
- **Commits**: Conventional Commits (e.g., `feat: add payment modal`, `fix: header alignment`).
- **Review**: Ensure no console errors and pass `pnpm run type-check` before PR.

## 9. Security

- **Authentication**: Managed via Supabase Auth.
- **RLS**: Row Level Security is STRICT. See `DATABASE_SCHEMA.md` for policy overview.
- **Secrets**: Never commit `.env` files. Use `.env.local` for local secrets.

---

_Generated for AI Context - Update this file when architecture or patterns change._
