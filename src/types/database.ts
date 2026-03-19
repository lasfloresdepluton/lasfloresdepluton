export type UserRole = 'admin' | 'customer' | 'wholesaler';
export type OrderStatus = 'pending' | 'producing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'retail' | 'wholesale';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          is_verified_wholesaler: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      fragrances: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fragrances']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['fragrances']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          retail_price: number;
          wholesale_price: number;
          wholesale_min_qty: number;
          is_active: boolean;
          is_pack: boolean;
          pack_slots: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          fragrance_id: string;
          stock: number;
          image_url: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          type: OrderType;
          total_amount: number;
          shipping_cost: number;
          shipping_address: Record<string, unknown> | null;
          shipping_method: string | null;
          scheduled_dispatch_date: string | null;
          payment_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          selected_fragrances: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      order_type: OrderType;
    };
  };
}
