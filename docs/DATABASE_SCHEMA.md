# Database Schema

This document outlines the Supabase database schema for the Tally application.

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

Customer orders.

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

### `payment_sessions`

Groups payments for an order (bill splitting).

- **id** (UUID, PK).
- **order_id** (UUID, FK -> `orders.id`).
- **status** (Enum): `active`, `completed`, `cancelled`.
- **total_cents** (Int): Total amount to be paid.
- **completed_at** (Timestamp, Nullable).

### `payments`

Individual payment transactions.

- **id** (UUID, PK).
- **session_id** (UUID, FK -> `payment_sessions.id`).
- **participant_id** (UUID): ID of the user/device paying.
- **amount_cents** (Int).
- **tip_cents** (Int).
- **payment_method** (Enum): `card`, `apple_pay`, `google_pay`, Nullable.
- **stripe_payment_id** (Text, Nullable).
- **status** (Enum): `pending`, `processing`, `completed`, `failed`.
- **items_paid** (JSON): Array of item IDs paid for by this transaction.
- **receipt_url** (Text, Nullable).

## 📇 Enums

- **UserRole**: `owner`, `manager`, `waiter`
- **TableStatus**: `available`, `occupied`, `paying`, `reserved`
- **OrderStatus**: `open`, `served`, `paying`, `closed`, `cancelled`
- **OrderItemStatus**: `pending`, `preparing`, `served`, `cancelled`
- **PaymentSessionStatus**: `active`, `completed`, `cancelled`
- **PaymentMethod**: `card`, `apple_pay`, `google_pay`
- **PaymentStatus**: `pending`, `processing`, `completed`, `failed`

## 🔐 Security (RLS)

- **Public Read**: `restaurants`, `categories`, `products`, `product_modifiers` (if active).
- **Authenticated Read/Write**: `orders`, `order_items` (linked to table/session).
- **Admin Only**: Full access to `users`, `tables`, `restaurants` settings.
