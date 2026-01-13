# Business Model & Tier Definition

## 🎯 Vision
Tally es una plataforma SaaS B2B para restauración que evoluciona desde una pasarela de pago inteligente hasta un sistema operativo completo (POS + KDS). El valor diferencial radica en la experiencia de pago colaborativa (Split the bill) y la flexibilidad de implementación.

---

## 💎 Subscription Tiers

La arquitectura de la aplicación debe soportar estos tres modos de funcionamiento de forma simultánea, activándose funcionalidades según la suscripción del restaurante (`subscription_tier` en DB).

### 🥉 Tier 1: ESSENTIAL (Pasarela de Pago)
**Concepto:** "Digitaliza el cobro, no la operación."
Tally funciona como un datáfono avanzado. No sustituye al TPV antiguo del restaurante.

- **Target:** Cafeterías, pequeños locales, restaurantes con TPVs legacy sin integración.
- **Flujo Operativo:**
  1. El camarero toma nota y suma la cuenta en su sistema habitual (libreta o TPV antiguo).
  2. Abre Tally, selecciona la mesa y **escribe manualmente el importe total** (ej: 45,50€).
  3. Tally genera el QR de pago.
  4. El cliente escanea y paga.
- **Capacidades:**
  - ✅ Pago con QR.
  - ✅ Propinas digitales.
  - ✅ División de cuenta: Solo "A partes iguales" o "Cantidad fija".
  - ❌ **NO** soporta división por productos (Tally desconoce qué se ha comido).
  - ❌ **NO** requiere gestión de inventario/menú detallado.
  - ❌ **NO** usa KDS (Pantalla de cocina).

### 🥈 Tier 2: PRO (All-in-One POS)
**Concepto:** "El Sistema Operativo de tu Restaurante."
Tally **ES** el TPV. El restaurante gestiona toda su operación (pedidos, cocina y cobro) desde Tally.

- **Target:** Restaurantes nuevos, locales modernos, food trucks.
- **Flujo Operativo (Modelo Híbrido):**
  1. El camarero toma la comanda usando Tally en una tablet/móvil (Comandero Digital).
  2. La orden se envía en tiempo real al **KDS (Kitchen Display System)** de Tally.
  3. Al pedir la cuenta, el QR ya contiene el desglose exacto de lo consumido.
- **Capacidades:**
  - ✅ Todo lo del Tier Essential.
  - ✅ **División por productos (Killer Feature):** "Yo pago mis 2 cervezas, tú tu hamburguesa".
  - ✅ Gestión de Menú completa (Categorías, Productos, Modificadores).
  - ✅ KDS (Pantalla de Cocina) sincronizada.
  - ✅ Gestión de impresoras (Tickets físicos).
  - ✅ Control de Caja y Ventas por camarero.

### 🥇 Tier 3: ENTERPRISE (Integraciones)
**Concepto:** "Conectividad Total."
Tally se conecta bidireccionalmente con sistemas ERP/POS externos (Oracle, Micros, ICG).

- **Target:** Cadenas, franquicias, grandes grupos de restauración.
- **Flujo Operativo:**
  - Los pedidos entran por el POS externo y se reflejan en Tally automáticamente (Webhook/API).
  - Los pagos en Tally cierran la mesa en el POS externo.
- **Capacidades:**
  - ✅ Todo lo del Tier Pro (pero usando el POS externo como "cerebro").
  - ✅ Sincronización de carta y precios en tiempo real.
  - ✅ API Access dedicado.
  - ✅ Soporte SLA prioritario.

---

## 🛠️ Feature Matrix (Technical Constraints)

| Feature | Tier ESSENTIAL | Tier PRO | Tier ENTERPRISE |
| :--- | :---: | :---: | :---: |
| **Origen de Datos** | Manual Input (Teclado numérico) | Tally Database (`orders` table) | External API Sync |
| **Menú** | No necesario | Obligatorio (en Supabase) | Sincronizado |
| **Split Bill** | Equal / Fixed Amount | **By Items** / Equal / Fixed | **By Items** / Equal / Fixed |
| **Hardware Cocina** | N/A | Tally KDS (Web) + Impresoras | Integración externa |
| **Receipts** | Total genérico | Detallado (Itemized) | Detallado (Itemized) |
| **Staff Role** | Solo cobrar | Tomar nota + Cobrar | Gestionar integración |
