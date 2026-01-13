# Business Model & Subscription Tiers

## 🎯 Vision
Tally is a B2B SaaS platform for restaurants that evolves from a smart payment gateway into a full Operating System (POS + KDS). The core value proposition lies in the collaborative payment experience (Split the bill) and deployment flexibility.

---

## 💎 Subscription Tiers

The application architecture supports three distinct operational modes, controlled by the `subscription_tier` flag in the restaurant configuration.

### 🥉 Tier 1: ESSENTIAL (Smart Payment Gateway)
**Concept:** "Digitize payments, not operations."
Tally acts as an advanced payment terminal. It does not replace the restaurant's legacy POS.

- **Target:** Cafes, small venues, restaurants with legacy non-integrated POS systems.
- **Operational Flow:**
  1. Waiter takes the order and sums the total using their existing system (paper or legacy POS).
  2. Waiter opens Tally, selects the table, and **manually inputs the total amount** (e.g., €45.50).
  3. Tally generates the payment QR code.
  4. Customer scans and pays.
- **Capabilities:**
  - ✅ QR Payments.
  - ✅ Digital Tips.
  - ✅ Bill Splitting: **Equal split** or **Fixed amount** only.
  - ❌ **NO** Itemized splitting (Tally is unaware of specific items ordered).
  - ❌ **NO** Menu management required.
  - ❌ **NO** KDS (Kitchen Display System) usage.

### 🥈 Tier 2: PRO (All-in-One POS)
**Concept:** "The Restaurant Operating System."
Tally **IS** the POS. The venue manages the entire operation (orders, kitchen, payments) within Tally.

- **Target:** New venues, modern restaurants, food trucks.
- **Operational Flow (Hybrid Model):**
  1. Waiter takes the order using Tally on a tablet/mobile ("Digital Pad").
  2. Order is sent in real-time to Tally's **KDS**.
  3. When requesting the bill, the QR code already contains the exact item breakdown.
- **Capabilities:**
  - ✅ All Essential features.
  - ✅ **Itemized Bill Splitting (Killer Feature):** "I pay for my 2 beers, you pay for the burger."
  - ✅ Full Menu Management (Categories, Products, Modifiers).
  - ✅ Syncronized KDS.
  - ✅ Printer Management (Physical receipts).
  - ✅ Staff Sales & Shift Management.

### 🥇 Tier 3: ENTERPRISE (Integrated)
**Concept:** "Total Connectivity."
Tally connects bi-directionally with external ERP/POS systems (Oracle, Micros, ICG).

- **Target:** Chains, franchises, hospitality groups.
- **Operational Flow:**
  - Orders are placed in the external POS and reflected in Tally automatically via Webhook/API.
  - Payments in Tally automatically close the table in the external POS.
- **Capabilities:**
  - ✅ All Pro features (but using external POS as the "brain").
  - ✅ Real-time menu & price synchronization.
  - ✅ Dedicated API Access.
  - ✅ SLA Support.

---

## 🛠️ Feature Matrix (Technical Constraints)

| Feature | Tier ESSENTIAL | Tier PRO | Tier ENTERPRISE |
| :--- | :---: | :---: | :---: |
| **Data Source** | Manual Input (Numeric Keypad) | Tally Database (`orders` table) | External API Sync |
| **Menu** | Not required | Required (in Supabase) | Synchronized |
| **Split Bill** | Equal / Fixed Amount | **By Items** / Equal / Fixed | **By Items** / Equal / Fixed |
| **Kitchen Flow** | N/A | Tally KDS (Web) + Printers | External Integration |
| **Receipts** | Generic Total | Detailed (Itemized) | Detailed (Itemized) |
| **Staff Role** | Payment Processor | Order Taker + Payment | Integration Manager |
