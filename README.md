# 💸 Tally - Sistema Operativo para Restaurantes

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**SaaS multi-tenant para la industria de hostelería** con división de cuentas QR, POS completo, KDS y cumplimiento fiscal español.

[Inicio Rápido](#-inicio-rápido) • [Documentación](#-documentación) • [Deploy](#-deploy)

</div>

---

## 📋 Descripción

Tally es un **Sistema Operativo integral para restaurantes** que moderniza toda la operación:

- **Plan Essential**: Capa de cobro digital que se integra con cualquier TPV antiguo
- **Plan Pro**: Reemplazo completo (Sala + Cocina + Caja)
- **Plan Enterprise**: Sincronización con ERPs corporativos

### Filosofía: "Waiter-First, Customer-Centric"

Buscamos la excelencia operativa sin barreras artificiales. Cada plan ofrece la mejor UX posible para su nivel.

---

## ✨ Características por Plan

### 📱 Aplicación del Cliente (`/go/[slug]`) - Universal

Disponible en **todos los planes** vía QR:

- **3 modalidades de pago**:
  - 🎯 **Split Dinámico**: División automática según personas activas en tiempo real
  - 💶 **Cantidad Exacta**: Input manual con botones rápidos
  - 🍕 **Por Item**: Selección individual de consumiciones (Solo Pro/Enterprise)
- **Propinas opcionales** (configurables por restaurante)
- **Branding personalizado** (logo y colores del restaurante)
- **Sincronización en tiempo real** entre comensales
- **Recibos fiscales** con Veri\*factu compliance

### 🔑 Plan Essential - Capa de Cobros

**Objetivo**: Modernizar el cobro sin cambiar el TPV existente

- ✅ Mapa visual de mesas
- ✅ Calculadora de importe manual
- ✅ Generación de QR en mesa
- ✅ Split dinámico y cantidad exacta
- ❌ Pago por item (desactivado - Tally no conoce productos)
- ❌ KDS (desactivado)
- ❌ Gestión de stock (desactivado)

### 🚀 Plan Pro - Sistema Completo

**Objetivo**: Reemplazo total del software del restaurante

- ✅ **POS Completo**:
  - Mapa de mesas con estados (libre, ocupada, esperando comida, pagando)
  - Toma de comanda con productos
  - Modificadores (simples y con precio)
  - Stock rápido (86'ing)
  - Flujo de cobro configurable (auto/manual)

- ✅ **KDS (Kitchen Display System)**:
  - 🚦 Semáforo de tiempos: 🟢 <10min | 🟡 10-20min | 🔴 >20min
  - 🍴 Smart Routing: Filtros Cocina/Barra
  - ↩️ Recall: Recuperar tickets borrados por error
  - Real-time sync con Supabase

- ✅ **Gestión de Caja**:
  - Apertura/cierre de caja
  - Registro de entradas/salidas
  - Z-Report completo (desglose efectivo/tarjeta/propinas)

- ✅ **RBAC (Control de Acceso)**:
  - Roles: Owner, Manager, Waiter
  - Managers autorizan Voids y Refunds
  - Audit logging completo

### 🏢 Plan Enterprise - Integrador

**Objetivo**: Para grandes cadenas con ERP central

- ✅ Todo de Plan Pro +
- 🔄 Sincronización bidireccional con ERPs (Oracle, SAP, Micros)
- 📊 Reporting centralizado multi-local

---

## 🏗️ Stack Tecnológico

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Forms**: React Hook Form + Zod
- **State**: Zustand + Immer

### Backend

- **Database**: Supabase (PostgreSQL + Real-time)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes + Server Actions

### Pagos

- **Processor**: Stripe
- **Compliance**: Veri\*factu (España)

### Testing

- **Unit**: Vitest
- **E2E**: Playwright
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode

---

## 🚀 Inicio Rápido

### Opción 1: Guía Rápida (15 min)

```bash
# 1. Clonar e instalar
git clone <url-repo>
cd tally
pnpm install

# 2. Configurar Supabase y env vars
# Sigue: QUICK_START.md (guía paso a paso)

# 3. Iniciar desarrollo
pnpm dev
```

📖 **Ver guía completa**: [`QUICK_START.md`](./QUICK_START.md)

### Opción 2: Setup Detallado

Para configuración detallada de Supabase desde cero:

📖 **Ver guía detallada**: [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)

---

## 📚 Documentación

### Guías de Inicio

- [`QUICK_START.md`](./QUICK_START.md) - Setup rápido (15 min)
- [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md) - Configuración detallada de Supabase
- [`CLAUDE.md`](./CLAUDE.md) - Guía para Claude Code (AI assistant)

### Arquitectura

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - Arquitectura del sistema
- [`docs/ROUTING.md`](./docs/ROUTING.md) - Estrategia de routing
- [`docs/SESSION_ARCHITECTURE.md`](./docs/SESSION_ARCHITECTURE.md) - Arquitectura de sesiones
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) - Schema de base de datos

### Features

- [`docs/API.md`](./docs/API.md) - Documentación de API
- [`docs/USER_FLOWS.md`](./docs/USER_FLOWS.md) - Flujos de usuario
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) - Sistema de diseño
- [`docs/LANDING.md`](./docs/LANDING.md) - Landing page (Astro)

### Testing y Deploy

- [`docs/TESTING.md`](./docs/TESTING.md) - Guía de testing
- [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) - Checklist de lanzamiento

---

## 🛠️ Comandos

### Desarrollo

```bash
# Next.js app (puerto 3000)
pnpm dev

# Astro landing (puerto 4321)
pnpm dev:landing

# Ambos simultáneamente
pnpm dev:all
```

### Build & Preview

```bash
# Build Next.js
pnpm build
pnpm start

# Build Astro landing
pnpm build:landing
pnpm preview:landing

# Build ambos
pnpm build:all
```

### Quality

```bash
# Linting
pnpm lint                # Next.js
pnpm lint:landing        # Astro
pnpm lint:all            # Ambos

# Type checking
pnpm type-check          # Next.js
pnpm type-check:landing  # Astro
pnpm type-check:all      # Ambos

# Format
pnpm format              # Next.js
pnpm format:landing      # Astro
pnpm format:all          # Ambos
```

### Testing

```bash
# Unit tests (Vitest)
pnpm test                # Watch mode
pnpm test --run          # Run once
pnpm test:coverage       # Con coverage

# E2E tests (Playwright)
pnpm test:e2e            # Requiere setup
```

### Database (Supabase Local)

```bash
pnpm supabase:start      # Iniciar local
pnpm supabase:stop       # Detener
pnpm supabase:reset      # Reset + migraciones
```

---

## 🏃 Deploy

### Producción

- **Next.js App**: Vercel (auto-deploy desde `main`)
  - URL: `https://app.paytally.app`
  - Config: `vercel.json`

- **Astro Landing**: Cloudflare Pages
  - URL: `https://paytally.app`
  - Static site con global CDN

### Pre-Deploy Checklist

1. ✅ Aplicar migraciones en Supabase producción
2. ✅ Configurar env vars en Vercel
3. ✅ Tests unitarios pasan (127/127)
4. ✅ Type-check limpio
5. ✅ Smoke test manual en staging

📖 **Guía completa**: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)

---

## 🧪 Estado de Testing

### ✅ Unit Tests: 100% PASSING

```
✓ 127 tests passed (4.5s)
✓ Split calculations (29 tests)
✓ Fiscal calculations (48 tests)
✓ Currency handling (zero rounding errors)
✓ Veri*factu compliance
✓ Component tests
```

### ✅ Type Safety: CLEAN

```
✓ tsc --noEmit (0 errors)
```

### ⚠️ E2E Tests: Infraestructura Lista

Tests implementados, requiere Supabase local para automatización.
Manual testing recomendado para lanzamiento v1.0.

📖 **Ver detalles**: [`docs/TESTING.md`](./docs/TESTING.md)

---

## 📦 Estructura del Proyecto

```
tally/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── go/[slug]/          # Customer flow (QR → Bill → Payment)
│   │   ├── hub/admin/          # Admin dashboard
│   │   ├── hub/pos/            # Point of Sale
│   │   ├── hub/kds/            # Kitchen Display
│   │   ├── hub/onboarding/     # Onboarding wizard
│   │   ├── api/                # API Routes
│   │   └── actions/            # Server Actions
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── bill/               # Bill splitting
│   │   ├── payment/            # Payment flow
│   │   └── pos/                # POS components
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   ├── api/                # API helpers + Zod validation
│   │   ├── fiscal/             # Veri*factu compliance
│   │   └── hooks/              # Custom React hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
├── apps/landing/               # Astro marketing site
├── supabase/
│   └── migrations/             # Database migrations (001-011)
├── e2e/                        # Playwright E2E tests
├── docs/                       # Documentation
└── public/                     # Static assets
```

---

## 🔐 Cumplimiento Legal (España)

### Veri\*factu Compliance

- ✅ **Inmutabilidad**: Hashes encadenados (hash N incluye hash N-1)
- ✅ **Universalidad**: Aplica a todos los planes
- ✅ **Trazabilidad**: Audit logs completos
- ✅ **API lista**: Preparada para envío a Hacienda

### Funciones DB Implementadas

```sql
generate_invoice_hash()         -- Generación de hash encadenado
generate_invoice_qr_data()      -- QR fiscal
calculate_tax_breakdown()       -- Desglose IVA (21%, 10%, 4%, 0%)
```

---

## 🤝 Contribuir

Contributions are welcome! Please read our contributing guidelines first.

1. Fork el repo
2. Crea una branch: `git checkout -b feature/amazing-feature`
3. Commit cambios: `git commit -m 'feat: add amazing feature'`
4. Push a branch: `git push origin feature/amazing-feature`
5. Abre un Pull Request

### Commit Convention

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructure without changing behavior
test: adding tests
chore: maintenance tasks
```

---

## 📄 Licencia

[Especificar licencia aquí]

---

## 🆘 Soporte

- 📖 **Documentación**: [`docs/`](./docs)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/tu-org/tally/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/tu-org/tally/discussions)

---

## 🎯 Roadmap

### v1.0 (Actual) ✅

- [x] Plan Essential (Keypad + QR)
- [x] Plan Pro (POS + KDS + Cash)
- [x] KDS Traffic Lights
- [x] KDS Smart Routing
- [x] KDS Recall Function
- [x] Veri\*factu compliance
- [x] RBAC con audit logging

### v1.1 (Próximo - 2 semanas)

- [ ] E2E tests automatizados (Supabase local)
- [ ] Payment flow UI toggle (auto/manual mode)
- [ ] Visual table map (drag-and-drop)
- [ ] Stripe edge case handling

### v1.2 (1 mes)

- [ ] Analytics dashboard
- [ ] Kitchen timing analytics
- [ ] Staff performance metrics
- [ ] Multi-restaurant support (owner con múltiples locales)

### v2.0 (Futuro)

- [ ] Plan Enterprise con ERP sync
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] API pública para integraciones

---

<div align="center">

**Hecho con ❤️ para la industria de hostelería**

[Sitio Web](https://paytally.app) • [Demo](https://app.paytally.app) • [Documentación](./docs)

</div>
