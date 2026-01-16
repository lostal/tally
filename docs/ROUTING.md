# Routing & URL Architecture

> **Purpose**: Define the complete URL structure for Tally across development and production environments.

## 1. URL Structure Overview

Tally uses a **path-based routing strategy** (not subdomain-based) to avoid complexity with:

- Cookie sharing across subdomains
- Local development hostname issues
- Supabase auth redirect complexity
- CORS and security policies

### Domain Strategy

| Environment | Main Domain        | Landing Page             |
| ----------- | ------------------ | ------------------------ |
| Development | `localhost:3000`   | `localhost:4321` (Astro) |
| Production  | `app.paytally.com` | `paytally.com` (Astro)   |

### URL Mapping

| Path                           | Purpose                   | Access                      |
| ------------------------------ | ------------------------- | --------------------------- |
| `/`                            | App home / navigation hub | Public                      |
| `/register`                    | New restaurant signup     | Public                      |
| `/pricing`                     | Pricing page              | Public                      |
| `/about`, `/terms`, `/privacy` | Legal pages               | Public                      |
| `/auth/callback`               | Supabase auth callback    | System                      |
| `/hub/admin/*`                 | Admin dashboard           | Authenticated (owner/admin) |
| `/hub/pos/*`                   | Point of Sale             | Authenticated (staff)       |
| `/hub/kds/*`                   | Kitchen Display           | Authenticated (staff)       |
| `/hub/onboarding/*`            | New restaurant setup      | Authenticated               |
| `/go/[slug]`                   | Customer bill view        | Public (via QR)             |
| `/api/*`                       | API routes                | Various                     |

## 2. Authentication Flow

### Registration Flow

```
/register (email + password)
    ↓
Supabase sends confirmation email
    ↓
User clicks link → /auth/callback?code=xxx
    ↓
Exchange code for session
    ↓
Redirect to /hub/onboarding
```

### Login Flow

```
/hub/admin/login
    ↓
Sign in with email/password
    ↓
Redirect to /hub/admin (or ?redirect param)
```

### Supabase Configuration

In Supabase Dashboard → Authentication → URL Configuration:

| Setting       | Development                           | Production                               |
| ------------- | ------------------------------------- | ---------------------------------------- |
| Site URL      | `http://localhost:3000`               | `https://app.paytally.com`               |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://app.paytally.com/auth/callback` |

**CRITICAL**: The `emailRedirectTo` in signup MUST match allowed redirect URLs exactly.

## 3. Middleware Rules

The middleware handles:

1. **Auth protection** for `/hub/*` routes
2. **Session refresh** on every request
3. **Redirect logic** for unauthenticated users

### Protected Routes

| Route Pattern       | Required Auth     | Redirect If Unauthenticated |
| ------------------- | ----------------- | --------------------------- |
| `/hub/admin/*`      | Owner/Admin       | `/hub/admin/login`          |
| `/hub/pos/*`        | Staff             | `/hub/pos/login`            |
| `/hub/kds/*`        | Staff             | `/hub/pos/login`            |
| `/hub/onboarding/*` | Any authenticated | `/hub/admin/login`          |

### Public Routes (no auth check)

- `/`, `/register`, `/pricing`, `/about`, `/terms`, `/privacy`
- `/auth/*` (callback routes)
- `/go/*` (customer-facing)
- `/api/*` (has own auth)
- `/_next/*`, `/favicon.ico` (static assets)

## 4. Integration with Landing (Astro)

### Development

- Next.js runs on `localhost:3000`
- Astro landing runs on `localhost:4321`
- Links from landing point to `localhost:3000/*`

### Production

- Landing at `paytally.com` (static, deployed separately)
- App at `app.paytally.com`
- Links from landing point to `app.paytally.com/*`

### Cross-linking

Use environment variables for cross-app URLs:

```typescript
// In Astro landing
const appUrl = import.meta.env.PUBLIC_APP_URL || 'https://app.paytally.com';
```

```typescript
// In Next.js app
const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'https://paytally.com';
```

## 5. Environment Variables

```env
# Next.js App
NEXT_PUBLIC_APP_URL=http://localhost:3000        # Self URL
NEXT_PUBLIC_LANDING_URL=http://localhost:4321    # Landing URL

# Production
NEXT_PUBLIC_APP_URL=https://app.paytally.com
NEXT_PUBLIC_LANDING_URL=https://paytally.com

# Supabase (MUST match Site URL config in dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## 6. QR Code URLs

Customer QR codes point to the `/go/` route:

| Environment | QR URL Pattern                       |
| ----------- | ------------------------------------ |
| Development | `http://localhost:3000/go/{slug}`    |
| Production  | `https://app.paytally.com/go/{slug}` |

The slug is the `unique_slug` from the `tables` table.

---

_Last updated: January 2026_
