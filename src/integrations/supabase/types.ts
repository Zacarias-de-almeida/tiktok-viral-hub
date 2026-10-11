export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      deliveries: {
        Row: {
          delivered_at: string
          entitlement_id: string
          id: string
        }
        Insert: {
          delivered_at?: string
          entitlement_id: string
          id?: string
        }
        Update: {
          delivered_at?: string
          entitlement_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_entitlement_id_fkey"
            columns: ["entitlement_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          granted_at: string
          id: string
          order_id: string
          product_id: string
          revoked_at: string | null
        }
        Insert: {
          granted_at?: string
          id?: string
          order_id: string
          product_id: string
          revoked_at?: string | null
        }
        Update: {
          granted_at?: string
          id?: string
          order_id?: string
          product_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price_kz: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price_kz: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price_kz?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          access_token_hash: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          id: string
          kind: Database["public"]["Enums"]["offer_kind"]
          paid_at: string | null
          parent_order_id: string | null
          provider: string | null
          provider_reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_kz: number
          updated_at: string
        }
        Insert: {
          access_token_hash: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          kind: Database["public"]["Enums"]["offer_kind"]
          paid_at?: string | null
          parent_order_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_kz: number
          updated_at?: string
        }
        Update: {
          access_token_hash?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["offer_kind"]
          paid_at?: string | null
          parent_order_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_kz?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount_kz: number
          created_at: string
          id: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          amount_kz: number
          created_at?: string
          id?: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          amount_kz?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          kind: Database["public"]["Enums"]["offer_kind"]
          name: string
          price_kz: number | null
          storage_path: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id: string
          kind: Database["public"]["Enums"]["offer_kind"]
          name: string
          price_kz?: number | null
          storage_path?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["offer_kind"]
          name?: string
          price_kz?: number | null
          storage_path?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          id: string
          order_id: string | null
          outcome: string
          payload: Json | null
          provider: string
          provider_event_id: string
          received_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          outcome: string
          payload?: Json | null
          provider: string
          provider_event_id: string
          received_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          outcome?: string
          payload?: Json | null
          provider?: string
          provider_event_id?: string
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      offer_kind: "main" | "order_bump" | "upsell" | "downsell"
      order_status: "pending" | "paid" | "failed" | "cancelled" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      offer_kind: ["main", "order_bump", "upsell", "downsell"],
      order_status: ["pending", "paid", "failed", "cancelled", "refunded"],
    },
  },
} as const
