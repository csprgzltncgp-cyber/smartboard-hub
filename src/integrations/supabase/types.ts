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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_plan_events: {
        Row: {
          activity_plan_id: string
          archived_at: string | null
          completed_at: string | null
          created_at: string
          custom_type_name: string | null
          description: string | null
          event_date: string
          event_time: string | null
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id: string
          is_free: boolean
          meeting_location: string | null
          meeting_mood: Database["public"]["Enums"]["meeting_mood"] | null
          meeting_summary: string | null
          meeting_type: string | null
          notes: string | null
          price: number | null
          status: Database["public"]["Enums"]["activity_event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          activity_plan_id: string
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          custom_type_name?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          is_free?: boolean
          meeting_location?: string | null
          meeting_mood?: Database["public"]["Enums"]["meeting_mood"] | null
          meeting_summary?: string | null
          meeting_type?: string | null
          notes?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["activity_event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          activity_plan_id?: string
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          custom_type_name?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          is_free?: boolean
          meeting_location?: string | null
          meeting_mood?: Database["public"]["Enums"]["meeting_mood"] | null
          meeting_summary?: string | null
          meeting_type?: string | null
          notes?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["activity_event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_plan_events_activity_plan_id_fkey"
            columns: ["activity_plan_id"]
            isOneToOne: false
            referencedRelation: "activity_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_plans: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          period_end: string
          period_start: string
          period_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_operators: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          language: string | null
          name: string
          phone: string | null
          smartboard_permissions: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          name: string
          phone?: string | null
          smartboard_permissions?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          name?: string
          phone?: string | null
          smartboard_permissions?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_client_director: boolean
          language: string | null
          name: string
          phone: string | null
          smartboard_permissions: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_client_director?: boolean
          language?: string | null
          name: string
          phone?: string | null
          smartboard_permissions?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_client_director?: boolean
          language?: string | null
          name?: string
          phone?: string | null
          smartboard_permissions?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          country_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_holder_revenue: {
        Row: {
          consultation_cost: number
          consultation_count: number
          contract_holder: Database["public"]["Enums"]["contract_holder_type"]
          country_id: string | null
          created_at: string
          currency: string
          id: string
          month: number
          revenue: number
          updated_at: string
          year: number
        }
        Insert: {
          consultation_cost?: number
          consultation_count?: number
          contract_holder: Database["public"]["Enums"]["contract_holder_type"]
          country_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          month: number
          revenue?: number
          updated_at?: string
          year: number
        }
        Update: {
          consultation_cost?: number
          consultation_count?: number
          contract_holder?: Database["public"]["Enums"]["contract_holder_type"]
          country_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          month?: number
          revenue?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_holder_revenue_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          company_name: string
          contact_name: string | null
          contacts: Json | null
          created_at: string
          details: Json | null
          email: string | null
          id: string
          meetings: Json | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          contacts?: Json | null
          created_at?: string
          details?: Json | null
          email?: string | null
          id?: string
          meetings?: Json | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          contacts?: Json | null
          created_at?: string
          details?: Json | null
          email?: string | null
          id?: string
          meetings?: Json | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      custom_invoice_items: {
        Row: {
          amount: number
          country_id: string
          created_at: string
          expert_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          country_id: string
          created_at?: string
          expert_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          country_id?: string
          created_at?: string
          expert_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_invoice_items_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_invoice_items_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_countries: {
        Row: {
          country_id: string
          created_at: string
          expert_id: string
          id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          expert_id: string
          id?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          expert_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_countries_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_crisis_countries: {
        Row: {
          country_id: string
          created_at: string
          expert_id: string
          id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          expert_id: string
          id?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          expert_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_crisis_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_crisis_countries_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_data: {
        Row: {
          city_id: string | null
          created_at: string
          expert_id: string
          house_number: string | null
          id: string
          max_inprogress_cases: number | null
          min_inprogress_cases: number | null
          native_language: string | null
          post_code: string | null
          street: string | null
          street_suffix: string | null
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          expert_id: string
          house_number?: string | null
          id?: string
          max_inprogress_cases?: number | null
          min_inprogress_cases?: number | null
          native_language?: string | null
          post_code?: string | null
          street?: string | null
          street_suffix?: string | null
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          expert_id?: string
          house_number?: string | null
          id?: string
          max_inprogress_cases?: number | null
          min_inprogress_cases?: number | null
          native_language?: string | null
          post_code?: string | null
          street?: string | null
          street_suffix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_data_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: true
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_files: {
        Row: {
          created_at: string
          expert_id: string
          file_path: string
          file_type: string
          filename: string
          id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          file_path: string
          file_type: string
          filename: string
          id?: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          file_path?: string
          file_type?: string
          filename?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_files_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_inactivity: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          reason: string | null
          until: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          reason?: string | null
          until: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          reason?: string | null
          until?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_inactivity_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_invoice_data: {
        Row: {
          created_at: string
          currency: string | null
          expert_id: string
          fixed_wage: number | null
          hourly_rate_15: number | null
          hourly_rate_30: number | null
          hourly_rate_50: number | null
          id: string
          invoicing_type: string | null
          ranking_hourly_rate: number | null
          single_session_rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          expert_id: string
          fixed_wage?: number | null
          hourly_rate_15?: number | null
          hourly_rate_30?: number | null
          hourly_rate_50?: number | null
          id?: string
          invoicing_type?: string | null
          ranking_hourly_rate?: number | null
          single_session_rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          expert_id?: string
          fixed_wage?: number | null
          hourly_rate_15?: number | null
          hourly_rate_30?: number | null
          hourly_rate_50?: number | null
          id?: string
          invoicing_type?: string | null
          ranking_hourly_rate?: number | null
          single_session_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_invoice_data_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: true
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_language_skills: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          language_skill_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          language_skill_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          language_skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_language_skills_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_language_skills_language_skill_id_fkey"
            columns: ["language_skill_id"]
            isOneToOne: false
            referencedRelation: "language_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_permissions: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          permission_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          permission_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_permissions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_specializations: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          specialization_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          specialization_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          specialization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_specializations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          contract_canceled: boolean | null
          country_id: string | null
          created_at: string
          crisis_psychologist: boolean | null
          email: string
          id: string
          is_active: boolean | null
          is_cgp_employee: boolean | null
          is_eap_online_expert: boolean | null
          is_locked: boolean | null
          language: string | null
          last_login_at: string | null
          name: string
          phone_number: string | null
          phone_prefix: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          contract_canceled?: boolean | null
          country_id?: string | null
          created_at?: string
          crisis_psychologist?: boolean | null
          email: string
          id?: string
          is_active?: boolean | null
          is_cgp_employee?: boolean | null
          is_eap_online_expert?: boolean | null
          is_locked?: boolean | null
          language?: string | null
          last_login_at?: string | null
          name: string
          phone_number?: string | null
          phone_prefix?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          contract_canceled?: boolean | null
          country_id?: string | null
          created_at?: string
          crisis_psychologist?: boolean | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_cgp_employee?: boolean | null
          is_eap_online_expert?: boolean | null
          is_locked?: boolean | null
          language?: string | null
          last_login_at?: string | null
          name?: string
          phone_number?: string | null
          phone_prefix?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      language_skills: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      manual_entries: {
        Row: {
          amount: number
          contract_holder:
            | Database["public"]["Enums"]["contract_holder_type"]
            | null
          country_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id: string
          month: number
          notes: string | null
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          contract_holder?:
            | Database["public"]["Enums"]["contract_holder_type"]
            | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id?: string
          month: number
          notes?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          contract_holder?:
            | Database["public"]["Enums"]["contract_holder_type"]
            | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          entry_type?: Database["public"]["Enums"]["entry_type"]
          id?: string
          month?: number
          notes?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "manual_entries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          currency: string
          custom_category_name: string | null
          id: string
          month: number
          notes: string | null
          updated_at: string
          year: number
        }
        Insert: {
          amount?: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_category_name?: string | null
          id?: string
          month: number
          notes?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_category_name?: string | null
          id?: string
          month?: number
          notes?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      specializations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_client_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          company_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          company_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_client_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_client_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
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
      activity_event_status:
        | "planned"
        | "approved"
        | "in_progress"
        | "completed"
        | "archived"
      activity_event_type:
        | "workshop"
        | "webinar"
        | "meeting"
        | "health_day"
        | "orientation"
        | "communication_refresh"
        | "other"
      contract_holder_type: "cgp_europe" | "telus" | "telus_wpo" | "compsych"
      entry_type: "income" | "expense"
      expense_category:
        | "gross_salary"
        | "corporate_tax"
        | "innovation_fee"
        | "vat"
        | "car_tax"
        | "local_business_tax"
        | "other_costs"
        | "supplier_invoices"
        | "custom"
      lead_status:
        | "lead"
        | "offer"
        | "deal"
        | "signed"
        | "incoming_company"
        | "cancelled"
      meeting_mood:
        | "very_positive"
        | "positive"
        | "neutral"
        | "negative"
        | "very_negative"
      meeting_type: "email" | "video" | "phone" | "personal"
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
      activity_event_status: [
        "planned",
        "approved",
        "in_progress",
        "completed",
        "archived",
      ],
      activity_event_type: [
        "workshop",
        "webinar",
        "meeting",
        "health_day",
        "orientation",
        "communication_refresh",
        "other",
      ],
      contract_holder_type: ["cgp_europe", "telus", "telus_wpo", "compsych"],
      entry_type: ["income", "expense"],
      expense_category: [
        "gross_salary",
        "corporate_tax",
        "innovation_fee",
        "vat",
        "car_tax",
        "local_business_tax",
        "other_costs",
        "supplier_invoices",
        "custom",
      ],
      lead_status: [
        "lead",
        "offer",
        "deal",
        "signed",
        "incoming_company",
        "cancelled",
      ],
      meeting_mood: [
        "very_positive",
        "positive",
        "neutral",
        "negative",
        "very_negative",
      ],
      meeting_type: ["email", "video", "phone", "personal"],
    },
  },
} as const
