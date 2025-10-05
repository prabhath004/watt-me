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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      allocation_policies: {
        Row: {
          day_soc_target_pct: number
          microgrid_id: string
          per_home_cap_kw: number | null
          policy: Database["public"]["Enums"]["allocation_t"]
          prioritize_critical: boolean
          updated_at: string
        }
        Insert: {
          day_soc_target_pct?: number
          microgrid_id: string
          per_home_cap_kw?: number | null
          policy?: Database["public"]["Enums"]["allocation_t"]
          prioritize_critical?: boolean
          updated_at?: string
        }
        Update: {
          day_soc_target_pct?: number
          microgrid_id?: string
          per_home_cap_kw?: number | null
          policy?: Database["public"]["Enums"]["allocation_t"]
          prioritize_critical?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_policies_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: true
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      homes: {
        Row: {
          batt_capacity_kwh: number
          batt_max_charge_kw: number
          batt_max_discharge_kw: number
          batt_soc_floor_pct: number
          created_at: string
          critical: boolean
          household_scale: number
          id: string
          label: string | null
          microgrid_id: string
          policy_allow_discharge: boolean
          pv_kwp: number
        }
        Insert: {
          batt_capacity_kwh: number
          batt_max_charge_kw: number
          batt_max_discharge_kw: number
          batt_soc_floor_pct: number
          created_at?: string
          critical?: boolean
          household_scale?: number
          id: string
          label?: string | null
          microgrid_id: string
          policy_allow_discharge?: boolean
          pv_kwp: number
        }
        Update: {
          batt_capacity_kwh?: number
          batt_max_charge_kw?: number
          batt_max_discharge_kw?: number
          batt_soc_floor_pct?: number
          created_at?: string
          critical?: boolean
          household_scale?: number
          id?: string
          label?: string | null
          microgrid_id?: string
          policy_allow_discharge?: boolean
          pv_kwp?: number
        }
        Relationships: [
          {
            foreignKeyName: "homes_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      microgrids: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string
        }
        Relationships: []
      }
      pool_ledger: {
        Row: {
          from_home: string
          id: number
          kwh: number
          microgrid_id: string
          to_home: string
          ts: string
        }
        Insert: {
          from_home: string
          id?: number
          kwh: number
          microgrid_id: string
          to_home: string
          ts: string
        }
        Update: {
          from_home?: string
          id?: number
          kwh?: number
          microgrid_id?: string
          to_home?: string
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_from_fk"
            columns: ["from_home", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "pool_ledger_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_to_fk"
            columns: ["to_home", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
        ]
      }
      rollup_daily_community: {
        Row: {
          day: string
          grid_export_wh: number
          grid_import_wh: number
          mg_used_wh: number
          microgrid_id: string
          prod_wh: number
          unserved_wh: number
        }
        Insert: {
          day: string
          grid_export_wh: number
          grid_import_wh: number
          mg_used_wh: number
          microgrid_id: string
          prod_wh: number
          unserved_wh: number
        }
        Update: {
          day?: string
          grid_export_wh?: number
          grid_import_wh?: number
          mg_used_wh?: number
          microgrid_id?: string
          prod_wh?: number
          unserved_wh?: number
        }
        Relationships: [
          {
            foreignKeyName: "rollup_daily_community_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      rollup_daily_home: {
        Row: {
          credits_net_wh: number
          day: string
          grid_export_wh: number
          grid_import_wh: number
          home_id: string
          mg_used_wh: number
          microgrid_id: string
          prod_wh: number
          use_wh: number
        }
        Insert: {
          credits_net_wh: number
          day: string
          grid_export_wh: number
          grid_import_wh: number
          home_id: string
          mg_used_wh: number
          microgrid_id: string
          prod_wh: number
          use_wh: number
        }
        Update: {
          credits_net_wh?: number
          day?: string
          grid_export_wh?: number
          grid_import_wh?: number
          home_id?: string
          mg_used_wh?: number
          microgrid_id?: string
          prod_wh?: number
          use_wh?: number
        }
        Relationships: [
          {
            foreignKeyName: "roll_home_fk"
            columns: ["home_id", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "rollup_daily_home_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_events: {
        Row: {
          created_at: string
          id: number
          microgrid_id: string
          payload: Json | null
          ts_end: string | null
          ts_start: string
          type: Database["public"]["Enums"]["event_t"]
        }
        Insert: {
          created_at?: string
          id?: number
          microgrid_id: string
          payload?: Json | null
          ts_end?: string | null
          ts_start: string
          type: Database["public"]["Enums"]["event_t"]
        }
        Update: {
          created_at?: string
          id?: number
          microgrid_id?: string
          payload?: Json | null
          ts_end?: string | null
          ts_start?: string
          type?: Database["public"]["Enums"]["event_t"]
        }
        Relationships: [
          {
            foreignKeyName: "sim_events_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_clock: {
        Row: {
          last_tick_at: string | null
          microgrid_id: string
          mode: Database["public"]["Enums"]["sim_mode_t"]
          sim_time: string
          speed: number
        }
        Insert: {
          last_tick_at?: string | null
          microgrid_id: string
          mode?: Database["public"]["Enums"]["sim_mode_t"]
          sim_time?: string
          speed?: number
        }
        Update: {
          last_tick_at?: string | null
          microgrid_id?: string
          mode?: Database["public"]["Enums"]["sim_mode_t"]
          sim_time?: string
          speed?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_clock_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: true
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffs: {
        Row: {
          effective_from: string
          effective_to: string | null
          export_cents_per_kwh: number
          id: string
          import_cents_per_kwh: number
          local_fair_rate_cents_per_kwh: number
          microgrid_id: string
        }
        Insert: {
          effective_from: string
          effective_to?: string | null
          export_cents_per_kwh: number
          id?: string
          import_cents_per_kwh: number
          local_fair_rate_cents_per_kwh: number
          microgrid_id: string
        }
        Update: {
          effective_from?: string
          effective_to?: string | null
          export_cents_per_kwh?: number
          id?: string
          import_cents_per_kwh?: number
          local_fair_rate_cents_per_kwh?: number
          microgrid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tariffs_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      tick_state: {
        Row: {
          credits_delta_wh: number
          grid_export_w: number
          grid_import_w: number
          home_id: string
          load_w: number
          microgrid_id: string
          pv_w: number
          receiving_w: number
          sharing_w: number
          soc_pct: number
          ts: string
        }
        Insert: {
          credits_delta_wh: number
          grid_export_w: number
          grid_import_w: number
          home_id: string
          load_w: number
          microgrid_id: string
          pv_w: number
          receiving_w: number
          sharing_w: number
          soc_pct: number
          ts: string
        }
        Update: {
          credits_delta_wh?: number
          grid_export_w?: number
          grid_import_w?: number
          home_id?: string
          load_w?: number
          microgrid_id?: string
          pv_w?: number
          receiving_w?: number
          sharing_w?: number
          soc_pct?: number
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "tick_home_fk"
            columns: ["home_id", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "tick_state_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      tick_state_community: {
        Row: {
          grid_export_w: number
          grid_import_w: number
          microgrid_id: string
          microgrid_used_w: number
          production_w: number
          ts: string
          unserved_w: number
        }
        Insert: {
          grid_export_w: number
          grid_import_w: number
          microgrid_id: string
          microgrid_used_w: number
          production_w: number
          ts: string
          unserved_w?: number
        }
        Update: {
          grid_export_w?: number
          grid_import_w?: number
          microgrid_id?: string
          microgrid_used_w?: number
          production_w?: number
          ts?: string
          unserved_w?: number
        }
        Relationships: [
          {
            foreignKeyName: "tick_state_community_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          home_id: string | null
          id: string
          microgrid_id: string | null
          role: Database["public"]["Enums"]["role_t"]
        }
        Insert: {
          created_at?: string
          email: string
          home_id?: string | null
          id?: string
          microgrid_id?: string | null
          role: Database["public"]["Enums"]["role_t"]
        }
        Update: {
          created_at?: string
          email?: string
          home_id?: string | null
          id?: string
          microgrid_id?: string | null
          role?: Database["public"]["Enums"]["role_t"]
        }
        Relationships: [
          {
            foreignKeyName: "users_home_fk"
            columns: ["home_id", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "users_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_community_today: {
        Row: {
          day: string | null
          grid_export_wh: number | null
          grid_import_wh: number | null
          mg_used_wh: number | null
          microgrid_id: string | null
          prod_wh: number | null
          unserved_wh: number | null
        }
        Insert: {
          day?: string | null
          grid_export_wh?: number | null
          grid_import_wh?: number | null
          mg_used_wh?: number | null
          microgrid_id?: string | null
          prod_wh?: number | null
          unserved_wh?: number | null
        }
        Update: {
          day?: string | null
          grid_export_wh?: number | null
          grid_import_wh?: number | null
          mg_used_wh?: number | null
          microgrid_id?: string | null
          prod_wh?: number | null
          unserved_wh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rollup_daily_community_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      v_grid_exchange_now: {
        Row: {
          from_grid_now_w_total: number | null
          microgrid_id: string | null
          to_grid_now_w_total: number | null
          ts: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tick_state_community_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      v_home_latest: {
        Row: {
          grid_export_w: number | null
          grid_import_w: number | null
          home_id: string | null
          load_w: number | null
          microgrid_id: string | null
          pv_w: number | null
          receiving_w: number | null
          sharing_w: number | null
          soc_pct: number | null
          ts: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tick_home_fk"
            columns: ["home_id", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "tick_state_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_today: {
        Row: {
          home_id: string | null
          load_w: number | null
          microgrid_id: string | null
          pv_w: number | null
          sent_to_grid_w: number | null
          ts: string | null
        }
        Insert: {
          home_id?: string | null
          load_w?: number | null
          microgrid_id?: string | null
          pv_w?: number | null
          sent_to_grid_w?: never
          ts?: string | null
        }
        Update: {
          home_id?: string | null
          load_w?: number | null
          microgrid_id?: string | null
          pv_w?: number | null
          sent_to_grid_w?: never
          ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tick_home_fk"
            columns: ["home_id", "microgrid_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id", "microgrid_id"]
          },
          {
            foreignKeyName: "tick_state_microgrid_id_fkey"
            columns: ["microgrid_id"]
            isOneToOne: false
            referencedRelation: "microgrids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_test_user: {
        Args: {
          test_email: string
          test_home_id?: string
          test_microgrid_id?: string
          test_password: string
          test_role: Database["public"]["Enums"]["role_t"]
        }
        Returns: string
      }
      get_user_home: {
        Args: { _user_id: string }
        Returns: {
          home_id: string
          microgrid_id: string
        }[]
      }
      get_user_microgrid: {
        Args: { _user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { _microgrid_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      allocation_t: "equal_share" | "need_based" | "cap_per_home"
      event_t: "OUTAGE" | "HEATWAVE" | "CLOUDBURST" | "EV_SURGE"
      grid_state_t: "export" | "import" | "neutral"
      role_t: "admin" | "user"
      sim_mode_t: "paused" | "realtime" | "accelerated"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      allocation_t: ["equal_share", "need_based", "cap_per_home"],
      event_t: ["OUTAGE", "HEATWAVE", "CLOUDBURST", "EV_SURGE"],
      grid_state_t: ["export", "import", "neutral"],
      role_t: ["admin", "user"],
      sim_mode_t: ["paused", "realtime", "accelerated"],
    },
  },
} as const
