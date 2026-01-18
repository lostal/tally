export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          resource_id: string;
          resource_type: string;
          restaurant_id: string;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          resource_id: string;
          resource_type: string;
          restaurant_id: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          resource_id?: string;
          resource_type?: string;
          restaurant_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cash_registers: {
        Row: {
          actual_cash_cents: number | null;
          closed_at: string | null;
          closed_by: string | null;
          created_at: string | null;
          difference_cents: number | null;
          expected_cash_cents: number | null;
          id: string;
          opened_at: string | null;
          opened_by: string;
          opening_amount_cents: number;
          restaurant_id: string;
          status: string | null;
          updated_at: string | null;
          z_report: Json | null;
        };
        Insert: {
          actual_cash_cents?: number | null;
          closed_at?: string | null;
          closed_by?: string | null;
          created_at?: string | null;
          difference_cents?: number | null;
          expected_cash_cents?: number | null;
          id?: string;
          opened_at?: string | null;
          opened_by: string;
          opening_amount_cents?: number;
          restaurant_id: string;
          status?: string | null;
          updated_at?: string | null;
          z_report?: Json | null;
        };
        Update: {
          actual_cash_cents?: number | null;
          closed_at?: string | null;
          closed_by?: string | null;
          created_at?: string | null;
          difference_cents?: number | null;
          expected_cash_cents?: number | null;
          id?: string;
          opened_at?: string | null;
          opened_by?: string;
          opening_amount_cents?: number;
          restaurant_id?: string;
          status?: string | null;
          updated_at?: string | null;
          z_report?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cash_registers_closed_by_fkey';
            columns: ['closed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cash_registers_opened_by_fkey';
            columns: ['opened_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cash_registers_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      cash_transactions: {
        Row: {
          amount_cents: number;
          created_at: string | null;
          id: string;
          notes: string | null;
          reason: string;
          register_id: string;
          restaurant_id: string;
          type: string;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reason: string;
          register_id: string;
          restaurant_id: string;
          type: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reason?: string;
          register_id?: string;
          restaurant_id?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cash_transactions_register_id_fkey';
            columns: ['register_id'];
            isOneToOne: false;
            referencedRelation: 'cash_registers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cash_transactions_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cash_transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          restaurant_id: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          restaurant_id: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          restaurant_id?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_items: {
        Row: {
          created_at: string | null;
          id: string;
          invoice_id: string;
          product_name: string;
          quantity: number;
          subtotal_cents: number;
          tax_cents: number;
          tax_rate: number;
          total_cents: number;
          unit_price_cents: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          invoice_id: string;
          product_name: string;
          quantity?: number;
          subtotal_cents: number;
          tax_cents: number;
          tax_rate?: number;
          total_cents: number;
          unit_price_cents: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          invoice_id?: string;
          product_name?: string;
          quantity?: number;
          subtotal_cents?: number;
          tax_cents?: number;
          tax_rate?: number;
          total_cents?: number;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      invoices: {
        Row: {
          cancelled_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          hash: string | null;
          id: string;
          invoice_number: string;
          issued_at: string | null;
          order_id: string | null;
          paid_at: string | null;
          previous_hash: string | null;
          qr_code: string | null;
          restaurant_id: string;
          series: string | null;
          status: string | null;
          subtotal_cents: number;
          tax_breakdown: Json | null;
          tax_cents: number;
          total_cents: number;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          hash?: string | null;
          id?: string;
          invoice_number: string;
          issued_at?: string | null;
          order_id?: string | null;
          paid_at?: string | null;
          previous_hash?: string | null;
          qr_code?: string | null;
          restaurant_id: string;
          series?: string | null;
          status?: string | null;
          subtotal_cents?: number;
          tax_breakdown?: Json | null;
          tax_cents?: number;
          total_cents?: number;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          hash?: string | null;
          id?: string;
          invoice_number?: string;
          issued_at?: string | null;
          order_id?: string | null;
          paid_at?: string | null;
          previous_hash?: string | null;
          qr_code?: string | null;
          restaurant_id?: string;
          series?: string | null;
          status?: string | null;
          subtotal_cents?: number;
          tax_breakdown?: Json | null;
          tax_cents?: number;
          total_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          claimed_by: string | null;
          claimed_quantity: number | null;
          created_at: string | null;
          id: string;
          modifiers: Json | null;
          notes: string | null;
          order_id: string;
          product_id: string;
          quantity: number;
          status: string | null;
          unit_price_cents: number;
          version: number | null;
        };
        Insert: {
          claimed_by?: string | null;
          claimed_quantity?: number | null;
          created_at?: string | null;
          id?: string;
          modifiers?: Json | null;
          notes?: string | null;
          order_id: string;
          product_id: string;
          quantity?: number;
          status?: string | null;
          unit_price_cents: number;
          version?: number | null;
        };
        Update: {
          claimed_by?: string | null;
          claimed_quantity?: number | null;
          created_at?: string | null;
          id?: string;
          modifiers?: Json | null;
          notes?: string | null;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          status?: string | null;
          unit_price_cents?: number;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_claimed_by_fkey';
            columns: ['claimed_by'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          closed_at: string | null;
          created_at: string | null;
          discount_cents: number | null;
          id: string;
          notes: string | null;
          restaurant_id: string;
          status: string | null;
          subtotal_cents: number | null;
          table_id: string;
          updated_at: string | null;
          void_reason: string | null;
          voided_at: string | null;
          voided_by: string | null;
          waiter_id: string | null;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string | null;
          discount_cents?: number | null;
          id?: string;
          notes?: string | null;
          restaurant_id: string;
          status?: string | null;
          subtotal_cents?: number | null;
          table_id: string;
          updated_at?: string | null;
          void_reason?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
          waiter_id?: string | null;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string | null;
          discount_cents?: number | null;
          id?: string;
          notes?: string | null;
          restaurant_id?: string;
          status?: string | null;
          subtotal_cents?: number | null;
          table_id?: string;
          updated_at?: string | null;
          void_reason?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
          waiter_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_table_id_fkey';
            columns: ['table_id'];
            isOneToOne: false;
            referencedRelation: 'tables';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_voided_by_fkey';
            columns: ['voided_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_waiter_id_fkey';
            columns: ['waiter_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      participants: {
        Row: {
          avatar_url: string | null;
          id: string;
          is_active: boolean | null;
          is_host: boolean | null;
          joined_at: string | null;
          last_seen_at: string | null;
          name: string;
          session_id: string;
          user_id: string | null;
          version: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_host?: boolean | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          name: string;
          session_id: string;
          user_id?: string | null;
          version?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_host?: boolean | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          name?: string;
          session_id?: string;
          user_id?: string | null;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          id: string;
          order_id: string;
          status: string | null;
          total_cents: number;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          order_id: string;
          status?: string | null;
          total_cents: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          order_id?: string;
          status?: string | null;
          total_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_sessions_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          completed_at: string | null;
          created_at: string | null;
          id: string;
          items_paid: Json | null;
          participant_id: string;
          payment_method: string | null;
          receipt_url: string | null;
          refund_amount_cents: number | null;
          refund_reason: string | null;
          refunded_at: string | null;
          refunded_by: string | null;
          session_id: string;
          status: string | null;
          stripe_payment_id: string | null;
          tip_cents: number | null;
        };
        Insert: {
          amount_cents: number;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          items_paid?: Json | null;
          participant_id: string;
          payment_method?: string | null;
          receipt_url?: string | null;
          refund_amount_cents?: number | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          session_id: string;
          status?: string | null;
          stripe_payment_id?: string | null;
          tip_cents?: number | null;
        };
        Update: {
          amount_cents?: number;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          items_paid?: Json | null;
          participant_id?: string;
          payment_method?: string | null;
          receipt_url?: string | null;
          refund_amount_cents?: number | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          session_id?: string;
          status?: string | null;
          stripe_payment_id?: string | null;
          tip_cents?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_refunded_by_fkey';
            columns: ['refunded_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'payment_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      product_modifiers: {
        Row: {
          created_at: string | null;
          id: string;
          is_required: boolean | null;
          name: string;
          price_cents: number | null;
          product_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_required?: boolean | null;
          name: string;
          price_cents?: number | null;
          product_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_required?: boolean | null;
          name?: string;
          price_cents?: number | null;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_modifiers_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_available: boolean | null;
          name: string;
          price_cents: number;
          restaurant_id: string;
          sort_order: number | null;
          tax_rate: number | null;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          name: string;
          price_cents: number;
          restaurant_id: string;
          sort_order?: number | null;
          tax_rate?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          name?: string;
          price_cents?: number;
          restaurant_id?: string;
          sort_order?: number | null;
          tax_rate?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurants: {
        Row: {
          created_at: string | null;
          fiscal_address: string | null;
          fiscal_city: string | null;
          fiscal_country: string | null;
          fiscal_name: string | null;
          fiscal_postal_code: string | null;
          id: string;
          is_active: boolean | null;
          logo_url: string | null;
          name: string;
          owner_auth_id: string | null;
          settings: Json | null;
          slug: string;
          subscription_id: string | null;
          tax_id: string | null;
          theme: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          fiscal_address?: string | null;
          fiscal_city?: string | null;
          fiscal_country?: string | null;
          fiscal_name?: string | null;
          fiscal_postal_code?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo_url?: string | null;
          name: string;
          owner_auth_id?: string | null;
          settings?: Json | null;
          slug: string;
          subscription_id?: string | null;
          tax_id?: string | null;
          theme?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          fiscal_address?: string | null;
          fiscal_city?: string | null;
          fiscal_country?: string | null;
          fiscal_name?: string | null;
          fiscal_postal_code?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo_url?: string | null;
          name?: string;
          owner_auth_id?: string | null;
          settings?: Json | null;
          slug?: string;
          subscription_id?: string | null;
          tax_id?: string | null;
          theme?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurants_subscription_id_fkey';
            columns: ['subscription_id'];
            isOneToOne: false;
            referencedRelation: 'subscriptions';
            referencedColumns: ['id'];
          },
        ];
      };
      sessions: {
        Row: {
          closed_at: string | null;
          created_at: string | null;
          id: string;
          restaurant_id: string;
          status: string | null;
          table_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string | null;
          id?: string;
          restaurant_id: string;
          status?: string | null;
          table_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string | null;
          id?: string;
          restaurant_id?: string;
          status?: string | null;
          table_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sessions_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_table_id_fkey';
            columns: ['table_id'];
            isOneToOne: false;
            referencedRelation: 'tables';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          canceled_at: string | null;
          commission_rate: number | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          has_kds: boolean | null;
          id: string;
          max_tables: number | null;
          max_users: number | null;
          plan: Database['public']['Enums']['subscription_plan'];
          restaurant_id: string | null;
          status: Database['public']['Enums']['subscription_status'];
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          trial_end: string | null;
          updated_at: string | null;
        };
        Insert: {
          canceled_at?: string | null;
          commission_rate?: number | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          has_kds?: boolean | null;
          id?: string;
          max_tables?: number | null;
          max_users?: number | null;
          plan?: Database['public']['Enums']['subscription_plan'];
          restaurant_id?: string | null;
          status?: Database['public']['Enums']['subscription_status'];
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          updated_at?: string | null;
        };
        Update: {
          canceled_at?: string | null;
          commission_rate?: number | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          has_kds?: boolean | null;
          id?: string;
          max_tables?: number | null;
          max_users?: number | null;
          plan?: Database['public']['Enums']['subscription_plan'];
          restaurant_id?: string | null;
          status?: Database['public']['Enums']['subscription_status'];
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: true;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      tables: {
        Row: {
          capacity: number | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          number: string;
          qr_code: string | null;
          restaurant_id: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          number: string;
          qr_code?: string | null;
          restaurant_id: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          capacity?: number | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          number?: string;
          qr_code?: string | null;
          restaurant_id?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tables_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          auth_id: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          pin: string | null;
          restaurant_id: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          auth_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          pin?: string | null;
          restaurant_id?: string | null;
          role: string;
          updated_at?: string | null;
        };
        Update: {
          auth_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          pin?: string | null;
          restaurant_id?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      void_approvals: {
        Row: {
          approved_by: string | null;
          created_at: string | null;
          id: string;
          order_id: string;
          reason: string;
          requested_by: string;
          resolved_at: string | null;
          restaurant_id: string;
          status: string | null;
        };
        Insert: {
          approved_by?: string | null;
          created_at?: string | null;
          id?: string;
          order_id: string;
          reason: string;
          requested_by: string;
          resolved_at?: string | null;
          restaurant_id: string;
          status?: string | null;
        };
        Update: {
          approved_by?: string | null;
          created_at?: string | null;
          id?: string;
          order_id?: string;
          reason?: string;
          requested_by?: string;
          resolved_at?: string | null;
          restaurant_id?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'void_approvals_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'void_approvals_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'void_approvals_requested_by_fkey';
            columns: ['requested_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'void_approvals_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_order_item: {
        Args: {
          p_expected_version: number;
          p_item_id: string;
          p_participant_id: string;
          p_quantity: number;
        };
        Returns: {
          error_message: string;
          new_version: number;
          success: boolean;
        }[];
      };
      close_cash_register: {
        Args: {
          p_actual_cash_cents: number;
          p_closed_by: string;
          p_register_id: string;
        };
        Returns: {
          actual_cash_cents: number | null;
          closed_at: string | null;
          closed_by: string | null;
          created_at: string | null;
          difference_cents: number | null;
          expected_cash_cents: number | null;
          id: string;
          opened_at: string | null;
          opened_by: string;
          opening_amount_cents: number;
          restaurant_id: string;
          status: string | null;
          updated_at: string | null;
          z_report: Json | null;
        };
        SetofOptions: {
          from: '*';
          to: 'cash_registers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deny_old_void_approvals: { Args: never; Returns: undefined };
      generate_invoice_hash: { Args: { p_invoice_id: string }; Returns: string };
      generate_invoice_number: {
        Args: { p_restaurant_id: string; p_series?: string };
        Returns: string;
      };
      generate_invoice_qr_data: {
        Args: { p_invoice_id: string };
        Returns: string;
      };
      generate_z_report: { Args: { p_register_id: string }; Returns: Json };
      get_plan_limits: {
        Args: { p_plan: Database['public']['Enums']['subscription_plan'] };
        Returns: {
          commission_rate: number;
          has_kds: boolean;
          max_tables: number;
          max_users: number;
        }[];
      };
      is_subscription_active: {
        Args: { p_restaurant_id: string };
        Returns: boolean;
      };
      release_order_item: {
        Args: { p_item_id: string; p_participant_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      subscription_plan: 'essential' | 'pro' | 'enterprise';
      subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      subscription_plan: ['essential', 'pro', 'enterprise'],
      subscription_status: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'],
    },
  },
} as const;

// ============================================
// Convenience Type Aliases (for backwards compatibility)
// ============================================
export type Restaurant = Tables<'restaurants'>;
export type Table = Tables<'tables'>;
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type User = Tables<'users'>;
export type Subscription = Tables<'subscriptions'>;
export type PaymentSession = Tables<'payment_sessions'>;
export type Payment = Tables<'payments'>;
export type Session = Tables<'sessions'>;
export type Participant = Tables<'participants'>;
export type Invoice = Tables<'invoices'>;
export type InvoiceItem = Tables<'invoice_items'>;
export type CashRegister = Tables<'cash_registers'>;
export type CashTransaction = Tables<'cash_transactions'>;
export type AuditLog = Tables<'audit_logs'>;
export type VoidApproval = Tables<'void_approvals'>;

// Insert types
export type RestaurantInsert = TablesInsert<'restaurants'>;
export type TableInsert = TablesInsert<'tables'>;
export type CategoryInsert = TablesInsert<'categories'>;
export type ProductInsert = TablesInsert<'products'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItemInsert = TablesInsert<'order_items'>;

// Theme type (legacy compatibility)
export interface RestaurantTheme {
  primaryColor: string;
  accentColor: string;
}
