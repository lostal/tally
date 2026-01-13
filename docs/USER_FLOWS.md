# User Flows

This document details the primary user journeys within the Tally ecosystem.

## 1. Customer Flow (The "Go" Experience)

**Context**: A guest at a restaurant scanning a QR code.

1.  **Entry Point**: User scans QR code at table.
    - URL: `https://go.paytally.app/[restaurant-slug]?table=[table-id]`
2.  **Trust Screen**:
    - User sees restaurant branding, table number, and "Open Tab" button.
    - _Action_: Clicks "Open Tab".
3.  **Bill View**:
    - User sees the live bill for the table (real-time updates).
    - Items are listed with quantities and prices.
4.  **Selection**:
    - _Action_: User selects specific items to pay OR selects "Split Evenly" / "Custom Amount".
5.  **Payment**:
    - _Action_: User proceeds to checkout.
    - System calculates total + optional tip.
    - Payment processed via Stripe (Apple Pay / Card).
6.  **Success**:
    - User sees success screen and digital receipt.
    - Table status updates in real-time.

## 2. Waiter/Staff Flow (POS)

**Context**: A waiter using a handheld device or tablet.

1.  **Login**:
    - URL: `https://hub.paytally.app/pos`
    - Authenticates via PIN or Email/Password.
2.  **Table Map**:
    - View status of all tables (Available, Occupied, Paying).
3.  **Order Taking**:
    - _Action_: Selects a table -> "New Order".
    - Browses menu categories and adds products.
    - Adds modifiers (e.g., "Medium Rare").
    - _Action_: Sends order to kitchen (updates status to `pending` -> `preparing`).
4.  **Table Management**:
    - Can print physical receipts.
    - Can move tables or split orders if needed (manually).

## 3. Admin/Manager Flow (Hub)

**Context**: A restaurant owner or manager configuring the system.

1.  **Dashboard**:
    - URL: `https://hub.paytally.app/admin`
    - Overview of real-time sales, active tables, and alerts.
2.  **Menu Management**:
    - Create/Edit Categories and Products.
    - Upload images, set prices, manage availability (86ing items).
3.  **Team Management**:
    - Create staff accounts and assign PINs.
4.  **Reporting**:
    - View historical sales data, popular items, and tip distribution.

## 4. Kitchen Flow (KDS) - _Future/Pro Tier_

**Context**: Kitchen staff viewing orders.

1.  **Display**:
    - Real-time feed of new `order_items` with status `pending`.
2.  **Action**:
    - Mark items as `preparing` -> `served`.
