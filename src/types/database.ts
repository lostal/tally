/**
 * Database types for Supabase
 *
 * These types match the schema defined in supabase/migrations/001_initial_schema.sql
 * In production, generate these with: npx supabase gen types typescript
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          theme: RestaurantTheme;
          settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          theme?: RestaurantTheme;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          theme?: RestaurantTheme;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          restaurant_id: string | null;
          auth_id: string | null;
          email: string | null;
          name: string;
          role: UserRole;
          pin: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id?: string | null;
          auth_id?: string | null;
          email?: string | null;
          name: string;
          role: UserRole;
          pin?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string | null;
          auth_id?: string | null;
          email?: string | null;
          name?: string;
          role?: UserRole;
          pin?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          restaurant_id: string;
          number: string;
          capacity: number;
          status: TableStatus;
          qr_code: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          number: string;
          capacity?: number;
          status?: TableStatus;
          qr_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          number?: string;
          capacity?: number;
          status?: TableStatus;
          qr_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price_cents: number;
          image_url: string | null;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price_cents: number;
          image_url?: string | null;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price_cents?: number;
          image_url?: string | null;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_modifiers: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price_cents: number;
          is_required: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price_cents?: number;
          is_required?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price_cents?: number;
          is_required?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          waiter_id: string | null;
          status: OrderStatus;
          subtotal_cents: number;
          discount_cents: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          table_id: string;
          waiter_id?: string | null;
          status?: OrderStatus;
          subtotal_cents?: number;
          discount_cents?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          table_id?: string;
          waiter_id?: string | null;
          status?: OrderStatus;
          subtotal_cents?: number;
          discount_cents?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_cents: number;
          modifiers: Json;
          notes: string | null;
          status: OrderItemStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price_cents: number;
          modifiers?: Json;
          notes?: string | null;
          status?: OrderItemStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price_cents?: number;
          modifiers?: Json;
          notes?: string | null;
          status?: OrderItemStatus;
          created_at?: string;
        };
      };
      payment_sessions: {
        Row: {
          id: string;
          order_id: string;
          status: PaymentSessionStatus;
          total_cents: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          status?: PaymentSessionStatus;
          total_cents: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: PaymentSessionStatus;
          total_cents?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string;
          amount_cents: number;
          tip_cents: number;
          payment_method: PaymentMethod | null;
          stripe_payment_id: string | null;
          status: PaymentStatus;
          items_paid: Json;
          receipt_url: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id: string;
          amount_cents: number;
          tip_cents?: number;
          payment_method?: PaymentMethod | null;
          stripe_payment_id?: string | null;
          status?: PaymentStatus;
          items_paid?: Json;
          receipt_url?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string;
          amount_cents?: number;
          tip_cents?: number;
          payment_method?: PaymentMethod | null;
          stripe_payment_id?: string | null;
          status?: PaymentStatus;
          items_paid?: Json;
          receipt_url?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      table_status: TableStatus;
      order_status: OrderStatus;
      order_item_status: OrderItemStatus;
      payment_session_status: PaymentSessionStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
  };
}

// Type aliases for convenience
export type UserRole = 'owner' | 'manager' | 'waiter';
export type TableStatus = 'available' | 'occupied' | 'paying' | 'reserved';
export type OrderStatus = 'open' | 'served' | 'paying' | 'closed' | 'cancelled';
export type OrderItemStatus = 'pending' | 'preparing' | 'served' | 'cancelled';
export type PaymentSessionStatus = 'active' | 'completed' | 'cancelled';
export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RestaurantTheme {
  primaryColor: string;
  accentColor: string;
}

// Table row types
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductModifier = Database['public']['Tables']['product_modifiers']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type PaymentSession = Database['public']['Tables']['payment_sessions']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];

// Insert types
export type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

// Update types
export type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

// Extended types with relations
export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[];
  table: Table;
}

export interface PaymentSessionWithPayments extends PaymentSession {
  payments: Payment[];
  order: OrderWithItems;
}
