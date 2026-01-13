# Database Schema

This document outlines the Supabase database schema for the Tally application.

> **Status**: Up to date with migrations `001` - `006`.

## 🗄️ Tables

### `restaurants`

Stores restaurant configuration and branding.

- **id** (UUID, PK): Unique identifier.
- **name** (Text): Restaurant name.
- **slug** (Text, Unique): URL slug for the restaurant (e.g., `hub.paytally.app/slug`).
- **logo_url** (Text, Nullable): URL to the logo image.
- **theme** (JSON): Stores `primaryColor` and `accentColor`.
- **settings** (JSON): Flexible settings object.
- **is_active** (Boolean): Soft delete flag.
- **owner_auth_id** (UUID, Nullable): Link to the owner's Auth ID (SaaS).
- **subscription_id** (UUID, FK -> `subscriptions.id`): Link to active subscription.
- **Fiscal Data** (for Invoices):
  - **fiscal_name** (Text)
  - **tax_id** (Text)
  - **fiscal_address**, **fiscal_city**, **fiscal_postal_code**, **fiscal_country** (Text)
- **created_at**, **updated_at** (Timestamp).

### `users`

Staff members and administrators.

- **id** (UUID, PK): Unique identifier.
- **restaurant_id** (UUID, FK -> `restaurants.id`): Tenant association.
- **auth_id** (UUID, Nullable): Link to Supabase Auth (`auth.users`).
- **email** (Text, Nullable): User email.
- **name** (Text): Display name.
- **role** (Enum): `owner`, `manager`, `waiter`.
- **pin** (Text, Nullable): Numeric PIN for POS access.
- **is_active** (Boolean): Soft delete flag.

### `tables`

Physical tables within a restaurant.

- **id** (UUID, PK): Unique identifier.
- **restaurant_id** (UUID, FK -> `restaurants.id`).
- **number** (Text): Table number/identifier (e.g., "10A").
- **capacity** (Int): Seat count.
- **status** (Enum): `available`, `occupied`, `paying`, `reserved`.
- **qr_code** (Text, Nullable): URL or payload for the QR code.
- **is_active** (Boolean).

### `categories`

Menu categories (e.g., "Starters", "Drinks").

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **name** (Text).
- **description** (Text, Nullable).
- **sort_order** (Int): Display order.
- **is_active** (Boolean).

### `products`

Menu items.

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **category_id** (UUID, FK -> `categories.id`): Optional category association.
- **name** (Text).
- **description** (Text, Nullable).
- **price_cents** (Int): Price in cents (integer).
- **tax_rate** (Decimal): VAT rate (e.g., 10.00).
- **image_url** (Text, Nullable).
- **is_available** (Boolean): Stock availability.
- **sort_order** (Int).

### `product_modifiers`

Options for products (e.g., "Extra Cheese").

- **id** (UUID, PK).
- **product_id** (UUID, FK -> `products.id`).
- **name** (Text).
- **price_cents** (Int): Additional cost.
- **is_required** (Boolean).

### `orders`

Customer orders (Comandas).

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **table_id** (UUID, FK -> `tables.id`).
- **waiter_id** (UUID, FK -> `users.id`, Nullable).
- **status** (Enum): `open`, `served`, `paying`, `closed`, `cancelled`.
- **subtotal_cents** (Int).
- **discount_cents** (Int).
- **notes** (Text, Nullable).
- **closed_at** (Timestamp, Nullable).

### `order_items`

Individual items within an order.

- **id** (UUID, PK).
- **order_id** (UUID, FK -> `orders.id`).
- **product_id** (UUID, FK -> `products.id`).
- **quantity** (Int).
- **unit_price_cents** (Int): Price at the time of ordering.
- **modifiers** (JSON): Selected modifiers snapshot.
- **notes** (Text, Nullable).
- **status** (Enum): `pending`, `preparing`, `served`, `cancelled`.
- **Optimistic Locking**:
  - **version** (Int): For concurrency control.
  - **claimed_by** (UUID -> `participants.id`): Who is paying for this.
  - **claimed_quantity** (Int).

### `sessions`

Dining sessions/visits (Optimistic Locking & Split Bills).

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **table_id** (UUID, FK).
- **status** (Text): `active`, `closed`.

### `participants`

Users participating in a session.

- **id** (UUID, PK).
- **session_id** (UUID, FK -> `sessions.id`).
- **user_id** (UUID, Nullable): Link to auth users.
- **name** (Text).
- **avatar_url** (Text).
- **is_host** (Boolean).
- **version** (Int).

### `payment_sessions`

Groups payments for an order (Legacy/Simple bill splitting).

- **id** (UUID, PK).
- **order_id** (UUID, FK -> `orders.id`).
- **status** (Enum): `active`, `completed`, `cancelled`.
- **total_cents** (Int): Total amount to be paid.
- **completed_at** (Timestamp, Nullable).

### `payments`

Individual payment transactions.

- **id** (UUID, PK).
- **session_id** (UUID, FK -> `payment_sessions.id`).
- **participant_id** (Text): ID of the user/device paying.
- **amount_cents** (Int).
- **tip_cents** (Int).
- **payment_method** (Enum): `card`, `apple_pay`, `google_pay`, Nullable.
- **stripe_payment_id** (Text, Nullable).
- **status** (Enum): `pending`, `processing`, `completed`, `failed`.
- **items_paid** (JSON): Array of item IDs paid for by this transaction.
- **receipt_url** (Text, Nullable).

### `invoices`

Fiscal invoices (Verifactu Compliance).

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **order_id** (UUID, FK).
- **invoice_number** (Text): Sequential (e.g., "2024-A-0001").
- **series** (Text): "A", "B", etc.
- **subtotal_cents**, **tax_cents**, **total_cents** (Int).
- **tax_breakdown** (JSON): VAT details.
- **hash**, **previous_hash** (Text): Chain integrity.
- **qr_code** (Text).
- **status** (Text): `draft`, `issued`, `paid`, `cancelled`.
- **deleted_at** (Timestamp): Soft delete only.

### `invoice_items`

Line items for fiscal invoices (Snapshot).

- **id** (UUID, PK).
- **invoice_id** (UUID, FK).
- **product_name** (Text).
- **quantity** (Int).
- **unit_price_cents**, **subtotal_cents**, **tax_cents**, **total_cents** (Int).
- **tax_rate** (Decimal).

### `subscriptions`

SaaS Subscription Management.

- **id** (UUID, PK).
- **restaurant_id** (UUID, FK).
- **plan** (Enum): `essential`, `pro`, `enterprise`.
- **status** (Enum): `trialing`, `active`, `past_due`, `canceled`, `unpaid`.
- **Stripe Fields**: `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`.
- **Limits**: `max_tables`, `max_users`, `has_kds`, `commission_rate`.

## 📇 Enums

- **UserRole**: `owner`, `manager`, `waiter`
- **TableStatus**: `available`, `occupied`, `paying`, `reserved`
- **OrderStatus**: `open`, `served`, `paying`, `closed`, `cancelled`
- **OrderItemStatus**: `pending`, `preparing`, `served`, `cancelled`
- **PaymentSessionStatus**: `active`, `completed`, `cancelled`
- **PaymentMethod**: `card`, `apple_pay`, `google_pay`
- **PaymentStatus**: `pending`, `processing`, `completed`, `failed`
- **SubscriptionPlan**: `essential`, `pro`, `enterprise`
- **SubscriptionStatus**: `trialing`, `active`, `past_due`, `canceled`, `unpaid`

## 🔐 Security (RLS)

- **Public Read (Filtered)**: `restaurants`, `categories`, `products`, `product_modifiers` (active only).
- **Session/Order Access**:
  - `orders`, `order_items` (open/active statuses).
  - `sessions`, `participants` (active only).
  - `payment_sessions`, `payments`.
- **Auth/Admin Only**: `users`, `tables`, `invoices`, `subscriptions`.
- **Owner Scope**: Owners can see their own restaurants and subscriptions via `owner_auth_id`.
