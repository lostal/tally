-- ============================================
-- TALLY - Initial Database Schema
-- ============================================
-- This migration creates all tables needed for:
-- - Restaurant management
-- - Menu management (categories, products)
-- - Table management
-- - Order management (comandas)
-- - Payment processing
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RESTAURANTS
-- ============================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    theme JSONB DEFAULT '{"primaryColor": "#000000", "accentColor": "#22c55e"}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- ============================================
-- USERS (Restaurant Staff)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    auth_id UUID UNIQUE, -- Links to Supabase Auth
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'waiter')),
    pin TEXT, -- For quick waiter login (hashed)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for restaurant staff lookups
CREATE INDEX idx_users_restaurant ON users(restaurant_id);
CREATE INDEX idx_users_auth ON users(auth_id);

-- ============================================
-- TABLES
-- ============================================
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'paying', 'reserved')),
    qr_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, number)
);

-- Index for restaurant tables
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX idx_tables_status ON tables(restaurant_id, status);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for restaurant categories
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(restaurant_id, is_available);

-- ============================================
-- PRODUCT MODIFIERS (extras, sizes, etc.)
-- ============================================
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_cents INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for product modifiers
CREATE INDEX idx_modifiers_product ON product_modifiers(product_id);

-- ============================================
-- ORDERS (Comandas)
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'served', 'paying', 'closed', 'cancelled')),
    subtotal_cents INTEGER DEFAULT 0,
    discount_cents INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Indexes for orders
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_waiter ON orders(waiter_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL,
    modifiers JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'served', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- PAYMENT SESSIONS
-- ============================================
CREATE TABLE payment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    total_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for payment sessions
CREATE INDEX idx_payment_sessions_order ON payment_sessions(order_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);

-- ============================================
-- PAYMENTS (Individual payments within a session)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL, -- Anonymous identifier for the payer
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    tip_cents INTEGER DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('card', 'apple_pay', 'google_pay')),
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    items_paid JSONB DEFAULT '[]'::jsonb, -- Array of {order_item_id, quantity}
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for payments
CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER tr_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ POLICIES (for customer app)
-- ============================================

-- Anyone can read active restaurants by slug
CREATE POLICY "Public can view active restaurants" ON restaurants
    FOR SELECT USING (is_active = true);

-- Anyone can read tables for active restaurants
CREATE POLICY "Public can view tables" ON tables
    FOR SELECT USING (
        is_active = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- Anyone can read active categories
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (
        is_active = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- Anyone can read available products
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (
        is_available = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- Anyone can read modifiers for available products
CREATE POLICY "Public can view modifiers" ON product_modifiers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_available = true)
    );

-- Anyone can read open/paying orders (for payment flow)
CREATE POLICY "Public can view active orders" ON orders
    FOR SELECT USING (status IN ('open', 'served', 'paying'));

-- Anyone can read order items for active orders
CREATE POLICY "Public can view order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.status IN ('open', 'served', 'paying'))
    );

-- Anyone can read active payment sessions
CREATE POLICY "Public can view payment sessions" ON payment_sessions
    FOR SELECT USING (status = 'active');

-- Anyone can read their own payments (via participant_id)
CREATE POLICY "Public can view payments" ON payments
    FOR SELECT USING (true);

-- ============================================
-- SERVICE ROLE BYPASS (for API routes)
-- ============================================
-- Note: Service role key bypasses RLS automatically

-- ============================================
-- SEED DATA (Demo Restaurant)
-- ============================================
INSERT INTO restaurants (name, slug, logo_url, theme, is_active)
VALUES (
    'Trattoria Mario',
    'trattoria-mario',
    NULL,
    '{"primaryColor": "#16a34a", "accentColor": "#22c55e"}'::jsonb,
    true
);

-- Get the restaurant ID for foreign keys
DO $$
DECLARE
    rest_id UUID;
    cat_starters UUID;
    cat_mains UUID;
    cat_desserts UUID;
    cat_drinks UUID;
    demo_table_id UUID;
BEGIN
    SELECT id INTO rest_id FROM restaurants WHERE slug = 'trattoria-mario';

    -- Create categories
    INSERT INTO categories (restaurant_id, name, sort_order, is_active) VALUES
        (rest_id, 'Entrantes', 1, true) RETURNING id INTO cat_starters;
    INSERT INTO categories (restaurant_id, name, sort_order, is_active) VALUES
        (rest_id, 'Principales', 2, true) RETURNING id INTO cat_mains;
    INSERT INTO categories (restaurant_id, name, sort_order, is_active) VALUES
        (rest_id, 'Postres', 3, true) RETURNING id INTO cat_desserts;
    INSERT INTO categories (restaurant_id, name, sort_order, is_active) VALUES
        (rest_id, 'Bebidas', 4, true) RETURNING id INTO cat_drinks;

    -- Create products
    INSERT INTO products (restaurant_id, category_id, name, description, price_cents, is_available, sort_order) VALUES
        (rest_id, cat_starters, 'Bruschetta', 'Pan tostado con tomate y albahaca', 650, true, 1),
        (rest_id, cat_starters, 'Carpaccio', 'Finas láminas de ternera con parmesano', 1200, true, 2),
        (rest_id, cat_mains, 'Pizza Margherita', 'Tomate, mozzarella y albahaca fresca', 1450, true, 1),
        (rest_id, cat_mains, 'Pasta Carbonara', 'Spaghetti con huevo, guanciale y pecorino', 1600, true, 2),
        (rest_id, cat_mains, 'Risotto ai Funghi', 'Arroz cremoso con setas variadas', 1550, true, 3),
        (rest_id, cat_desserts, 'Tiramisú', 'Postre clásico italiano con café y mascarpone', 850, true, 1),
        (rest_id, cat_desserts, 'Panna Cotta', 'Crema italiana con frutos rojos', 750, true, 2),
        (rest_id, cat_drinks, 'Agua con gas', 'Botella 500ml', 400, true, 1),
        (rest_id, cat_drinks, 'Café expreso', 'Café italiano tradicional', 300, true, 2),
        (rest_id, cat_drinks, 'Vino tinto (copa)', 'Chianti Classico', 550, true, 3);

    -- Create tables
    INSERT INTO tables (restaurant_id, number, capacity, status, is_active) VALUES
        (rest_id, '1', 2, 'available', true),
        (rest_id, '2', 4, 'available', true),
        (rest_id, '3', 4, 'available', true),
        (rest_id, '4', 6, 'available', true),
        (rest_id, '5', 6, 'available', true),
        (rest_id, '6', 2, 'available', true),
        (rest_id, '7', 4, 'available', true);

    -- Create a demo order for table 7
    SELECT id INTO demo_table_id FROM tables WHERE restaurant_id = rest_id AND number = '7';

    UPDATE tables SET status = 'occupied' WHERE id = demo_table_id;

    INSERT INTO orders (restaurant_id, table_id, status, subtotal_cents, notes)
    SELECT
        rest_id,
        demo_table_id,
        'open',
        5750,
        'Demo order'
    WHERE demo_table_id IS NOT NULL;

    -- Add items to the demo order
    INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents, status)
    SELECT
        o.id,
        p.id,
        CASE
            WHEN p.name = 'Pizza Margherita' THEN 1
            WHEN p.name = 'Pasta Carbonara' THEN 1
            WHEN p.name = 'Tiramisú' THEN 2
            WHEN p.name = 'Agua con gas' THEN 2
            WHEN p.name = 'Café expreso' THEN 2
        END,
        p.price_cents,
        'served'
    FROM orders o
    CROSS JOIN products p
    WHERE o.table_id = demo_table_id
    AND p.name IN ('Pizza Margherita', 'Pasta Carbonara', 'Tiramisú', 'Agua con gas', 'Café expreso');

END $$;
