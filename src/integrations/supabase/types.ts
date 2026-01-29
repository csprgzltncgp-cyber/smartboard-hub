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
      cities: {
        Row: {
          country_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          country_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          connected_company_id: string | null
          contact_email: string | null
          contact_phone: string | null
          contract_holder_type: string | null
          country_id: string
          created_at: string
          dispatch_name: string | null
          id: string
          lead_account_user_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          connected_company_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_holder_type?: string | null
          country_id: string
          created_at?: string
          dispatch_name?: string | null
          id?: string
          lead_account_user_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          connected_company_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_holder_type?: string | null
          country_id?: string
          created_at?: string
          dispatch_name?: string | null
          id?: string
          lead_account_user_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_connected_company_id_fkey"
            columns: ["connected_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_lead_account_user_id_fkey"
            columns: ["lead_account_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_billing_data: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_country_id: string | null
          billing_frequency: number | null
          billing_name: string | null
          billing_postal_code: string | null
          company_id: string
          contact_holder_name: string | null
          contracted_entity_id: string | null
          country_id: string | null
          created_at: string
          currency: string | null
          custom_email_subject: string | null
          eu_tax_number: string | null
          id: string
          invoice_language: string | null
          invoice_online_url: string | null
          payment_deadline: number | null
          post_address: string | null
          post_city: string | null
          post_country_id: string | null
          post_postal_code: string | null
          send_invoice_by_email: boolean | null
          send_invoice_by_post: boolean | null
          show_contact_holder_name_on_post: boolean | null
          tax_number: string | null
          updated_at: string
          upload_invoice_online: boolean | null
          vat_rate: number | null
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country_id?: string | null
          billing_frequency?: number | null
          billing_name?: string | null
          billing_postal_code?: string | null
          company_id: string
          contact_holder_name?: string | null
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          currency?: string | null
          custom_email_subject?: string | null
          eu_tax_number?: string | null
          id?: string
          invoice_language?: string | null
          invoice_online_url?: string | null
          payment_deadline?: number | null
          post_address?: string | null
          post_city?: string | null
          post_country_id?: string | null
          post_postal_code?: string | null
          send_invoice_by_email?: boolean | null
          send_invoice_by_post?: boolean | null
          show_contact_holder_name_on_post?: boolean | null
          tax_number?: string | null
          updated_at?: string
          upload_invoice_online?: boolean | null
          vat_rate?: number | null
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country_id?: string | null
          billing_frequency?: number | null
          billing_name?: string | null
          billing_postal_code?: string | null
          company_id?: string
          contact_holder_name?: string | null
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          currency?: string | null
          custom_email_subject?: string | null
          eu_tax_number?: string | null
          id?: string
          invoice_language?: string | null
          invoice_online_url?: string | null
          payment_deadline?: number | null
          post_address?: string | null
          post_city?: string | null
          post_country_id?: string | null
          post_postal_code?: string | null
          send_invoice_by_email?: boolean | null
          send_invoice_by_post?: boolean | null
          show_contact_holder_name_on_post?: boolean | null
          tax_number?: string | null
          updated_at?: string
          upload_invoice_online?: boolean | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_billing_data_billing_country_id_fkey"
            columns: ["billing_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_billing_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_billing_data_contracted_entity_id_fkey"
            columns: ["contracted_entity_id"]
            isOneToOne: false
            referencedRelation: "company_contracted_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_billing_data_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_billing_data_post_country_id_fkey"
            columns: ["post_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_billing_emails: {
        Row: {
          billing_data_id: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          billing_data_id: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          billing_data_id?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_billing_emails_billing_data_id_fkey"
            columns: ["billing_data_id"]
            isOneToOne: false
            referencedRelation: "company_billing_data"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contracted_entities: {
        Row: {
          company_id: string
          consultation_rows: Json | null
          contract_currency: string | null
          contract_date: string | null
          contract_end_date: string | null
          contract_holder_type: string | null
          contract_price: number | null
          country_id: string
          created_at: string
          crisis_data: Json | null
          headcount: number | null
          id: string
          inactive_headcount: number | null
          industry: string | null
          name: string
          occasions: number | null
          org_id: string | null
          pillars: number | null
          price_history: Json | null
          price_type: string | null
          reporting_data: Json | null
          updated_at: string
          workshop_data: Json | null
        }
        Insert: {
          company_id: string
          consultation_rows?: Json | null
          contract_currency?: string | null
          contract_date?: string | null
          contract_end_date?: string | null
          contract_holder_type?: string | null
          contract_price?: number | null
          country_id: string
          created_at?: string
          crisis_data?: Json | null
          headcount?: number | null
          id?: string
          inactive_headcount?: number | null
          industry?: string | null
          name: string
          occasions?: number | null
          org_id?: string | null
          pillars?: number | null
          price_history?: Json | null
          price_type?: string | null
          reporting_data?: Json | null
          updated_at?: string
          workshop_data?: Json | null
        }
        Update: {
          company_id?: string
          consultation_rows?: Json | null
          contract_currency?: string | null
          contract_date?: string | null
          contract_end_date?: string | null
          contract_holder_type?: string | null
          contract_price?: number | null
          country_id?: string
          created_at?: string
          crisis_data?: Json | null
          headcount?: number | null
          id?: string
          inactive_headcount?: number | null
          industry?: string | null
          name?: string
          occasions?: number | null
          org_id?: string | null
          pillars?: number | null
          price_history?: Json | null
          price_type?: string | null
          reporting_data?: Json | null
          updated_at?: string
          workshop_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "company_contracted_entities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contracted_entities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_countries: {
        Row: {
          company_id: string
          country_id: string
          created_at: string
          id: string
        }
        Insert: {
          company_id: string
          country_id: string
          created_at?: string
          id?: string
        }
        Update: {
          company_id?: string
          country_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_countries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_country_differentiates: {
        Row: {
          company_id: string
          contract_date: boolean
          contract_holder: boolean
          created_at: string
          has_multiple_entities: boolean
          id: string
          invoicing: boolean
          org_id: boolean
          reporting: boolean
          updated_at: string
        }
        Insert: {
          company_id: string
          contract_date?: boolean
          contract_holder?: boolean
          created_at?: string
          has_multiple_entities?: boolean
          id?: string
          invoicing?: boolean
          org_id?: boolean
          reporting?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string
          contract_date?: boolean
          contract_holder?: boolean
          created_at?: string
          has_multiple_entities?: boolean
          id?: string
          invoicing?: boolean
          org_id?: boolean
          reporting?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_country_differentiates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_country_settings: {
        Row: {
          company_id: string
          contract_date: string | null
          contract_end_date: string | null
          country_id: string
          created_at: string
          id: string
          org_id: string | null
          reporting_data: Json | null
          updated_at: string
        }
        Insert: {
          company_id: string
          contract_date?: string | null
          contract_end_date?: string | null
          country_id: string
          created_at?: string
          id?: string
          org_id?: string | null
          reporting_data?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          contract_date?: string | null
          contract_end_date?: string | null
          country_id?: string
          created_at?: string
          id?: string
          org_id?: string | null
          reporting_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_country_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_country_settings_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invoice_comments: {
        Row: {
          comment: string
          company_id: string
          contracted_entity_id: string | null
          country_id: string | null
          created_at: string
          id: string
          template_id: string | null
        }
        Insert: {
          comment: string
          company_id: string
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          template_id?: string | null
        }
        Update: {
          comment?: string
          company_id?: string
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_invoice_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_comments_contracted_entity_id_fkey"
            columns: ["contracted_entity_id"]
            isOneToOne: false
            referencedRelation: "company_contracted_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_comments_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_comments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "company_invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invoice_items: {
        Row: {
          amount: number
          company_id: string
          contracted_entity_id: string | null
          country_id: string | null
          created_at: string
          id: string
          name: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          name: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          contracted_entity_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          name?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invoice_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_items_contracted_entity_id_fkey"
            columns: ["contracted_entity_id"]
            isOneToOne: false
            referencedRelation: "company_contracted_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_items_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "company_invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invoice_templates: {
        Row: {
          admin_identifier: string | null
          city: string | null
          community_tax_number: string | null
          company_id: string
          contracted_entity_id: string | null
          country: string | null
          country_id: string | null
          created_at: string
          group_id: string | null
          house_number: string | null
          id: string
          invoicing_inactive: boolean | null
          invoicing_inactive_from: string | null
          invoicing_inactive_to: string | null
          is_address_shown: boolean | null
          is_name_shown: boolean | null
          is_payment_deadline_shown: boolean | null
          is_po_number_changing: boolean | null
          is_po_number_required: boolean | null
          is_po_number_shown: boolean | null
          is_tax_number_shown: boolean | null
          name: string
          payment_deadline: number | null
          po_number: string | null
          postal_code: string | null
          street: string | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          admin_identifier?: string | null
          city?: string | null
          community_tax_number?: string | null
          company_id: string
          contracted_entity_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          group_id?: string | null
          house_number?: string | null
          id?: string
          invoicing_inactive?: boolean | null
          invoicing_inactive_from?: string | null
          invoicing_inactive_to?: string | null
          is_address_shown?: boolean | null
          is_name_shown?: boolean | null
          is_payment_deadline_shown?: boolean | null
          is_po_number_changing?: boolean | null
          is_po_number_required?: boolean | null
          is_po_number_shown?: boolean | null
          is_tax_number_shown?: boolean | null
          name?: string
          payment_deadline?: number | null
          po_number?: string | null
          postal_code?: string | null
          street?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          admin_identifier?: string | null
          city?: string | null
          community_tax_number?: string | null
          company_id?: string
          contracted_entity_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          group_id?: string | null
          house_number?: string | null
          id?: string
          invoicing_inactive?: boolean | null
          invoicing_inactive_from?: string | null
          invoicing_inactive_to?: string | null
          is_address_shown?: boolean | null
          is_name_shown?: boolean | null
          is_payment_deadline_shown?: boolean | null
          is_po_number_changing?: boolean | null
          is_po_number_required?: boolean | null
          is_po_number_shown?: boolean | null
          is_tax_number_shown?: boolean | null
          name?: string
          payment_deadline?: number | null
          po_number?: string | null
          postal_code?: string | null
          street?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invoice_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_templates_contracted_entity_id_fkey"
            columns: ["contracted_entity_id"]
            isOneToOne: false
            referencedRelation: "company_contracted_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoice_templates_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invoices: {
        Row: {
          amount: number
          company_id: string
          country_id: string
          created_at: string
          currency: string
          description: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          country_id: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          country_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoices_country_id_fkey"
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
      expert_cities: {
        Row: {
          city_id: string
          created_at: string
          expert_id: string
          id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          expert_id: string
          id?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          expert_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_cities_expert_id_fkey"
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
          is_indefinite: boolean
          reason: string | null
          start_date: string
          until: string | null
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          is_indefinite?: boolean
          reason?: string | null
          start_date?: string
          until?: string | null
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          is_indefinite?: boolean
          reason?: string | null
          start_date?: string
          until?: string | null
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
      expert_outsource_countries: {
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
            foreignKeyName: "expert_outsource_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_outsource_countries_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
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
      expert_team_members: {
        Row: {
          accepts_chat_consultation: boolean | null
          accepts_onsite_consultation: boolean | null
          accepts_personal_consultation: boolean | null
          accepts_phone_consultation: boolean | null
          accepts_video_consultation: boolean | null
          created_at: string
          email: string
          expert_id: string
          id: string
          is_active: boolean | null
          is_cgp_employee: boolean | null
          is_eap_online_expert: boolean | null
          is_team_leader: boolean | null
          language: string | null
          name: string
          phone_number: string | null
          phone_prefix: string | null
          updated_at: string
          video_consultation_type: string | null
        }
        Insert: {
          accepts_chat_consultation?: boolean | null
          accepts_onsite_consultation?: boolean | null
          accepts_personal_consultation?: boolean | null
          accepts_phone_consultation?: boolean | null
          accepts_video_consultation?: boolean | null
          created_at?: string
          email: string
          expert_id: string
          id?: string
          is_active?: boolean | null
          is_cgp_employee?: boolean | null
          is_eap_online_expert?: boolean | null
          is_team_leader?: boolean | null
          language?: string | null
          name: string
          phone_number?: string | null
          phone_prefix?: string | null
          updated_at?: string
          video_consultation_type?: string | null
        }
        Update: {
          accepts_chat_consultation?: boolean | null
          accepts_onsite_consultation?: boolean | null
          accepts_personal_consultation?: boolean | null
          accepts_phone_consultation?: boolean | null
          accepts_video_consultation?: boolean | null
          created_at?: string
          email?: string
          expert_id?: string
          id?: string
          is_active?: boolean | null
          is_cgp_employee?: boolean | null
          is_eap_online_expert?: boolean | null
          is_team_leader?: boolean | null
          language?: string | null
          name?: string
          phone_number?: string | null
          phone_prefix?: string | null
          updated_at?: string
          video_consultation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_team_members_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          accepts_chat_consultation: boolean | null
          accepts_onsite_consultation: boolean | null
          accepts_personal_consultation: boolean | null
          accepts_phone_consultation: boolean | null
          accepts_video_consultation: boolean | null
          billing_address: string | null
          billing_city: string | null
          billing_country_id: string | null
          billing_email: string | null
          billing_name: string | null
          billing_postal_code: string | null
          billing_tax_number: string | null
          company_address: string | null
          company_city: string | null
          company_country_id: string | null
          company_name: string | null
          company_postal_code: string | null
          company_registration_number: string | null
          contract_canceled: boolean | null
          country_id: string | null
          created_at: string
          crisis_psychologist: boolean | null
          email: string
          expert_type: Database["public"]["Enums"]["expert_type"]
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
          tax_number: string | null
          updated_at: string
          username: string | null
          video_consultation_type: string | null
        }
        Insert: {
          accepts_chat_consultation?: boolean | null
          accepts_onsite_consultation?: boolean | null
          accepts_personal_consultation?: boolean | null
          accepts_phone_consultation?: boolean | null
          accepts_video_consultation?: boolean | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country_id?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_tax_number?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country_id?: string | null
          company_name?: string | null
          company_postal_code?: string | null
          company_registration_number?: string | null
          contract_canceled?: boolean | null
          country_id?: string | null
          created_at?: string
          crisis_psychologist?: boolean | null
          email: string
          expert_type?: Database["public"]["Enums"]["expert_type"]
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
          tax_number?: string | null
          updated_at?: string
          username?: string | null
          video_consultation_type?: string | null
        }
        Update: {
          accepts_chat_consultation?: boolean | null
          accepts_onsite_consultation?: boolean | null
          accepts_personal_consultation?: boolean | null
          accepts_phone_consultation?: boolean | null
          accepts_video_consultation?: boolean | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country_id?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_tax_number?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country_id?: string | null
          company_name?: string | null
          company_postal_code?: string | null
          company_registration_number?: string | null
          contract_canceled?: boolean | null
          country_id?: string | null
          created_at?: string
          crisis_psychologist?: boolean | null
          email?: string
          expert_type?: Database["public"]["Enums"]["expert_type"]
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
          tax_number?: string | null
          updated_at?: string
          username?: string | null
          video_consultation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_billing_country_id_fkey"
            columns: ["billing_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experts_company_country_id_fkey"
            columns: ["company_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
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
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specializations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_cities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          team_member_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          team_member_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_cities_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_countries: {
        Row: {
          country_id: string
          created_at: string
          id: string
          team_member_id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          team_member_id: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_countries_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_data: {
        Row: {
          city_id: string | null
          created_at: string
          house_number: string | null
          id: string
          max_inprogress_cases: number | null
          min_inprogress_cases: number | null
          native_language: string | null
          post_code: string | null
          street: string | null
          street_suffix: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          house_number?: string | null
          id?: string
          max_inprogress_cases?: number | null
          min_inprogress_cases?: number | null
          native_language?: string | null
          post_code?: string | null
          street?: string | null
          street_suffix?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          house_number?: string | null
          id?: string
          max_inprogress_cases?: number | null
          min_inprogress_cases?: number | null
          native_language?: string | null
          post_code?: string | null
          street?: string | null
          street_suffix?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_data_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: true
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_files: {
        Row: {
          created_at: string
          file_path: string
          file_type: string
          filename: string
          id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_type: string
          filename: string
          id?: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_type?: string
          filename?: string
          id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_files_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_language_skills: {
        Row: {
          created_at: string
          id: string
          language_skill_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_skill_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language_skill_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_language_skills_language_skill_id_fkey"
            columns: ["language_skill_id"]
            isOneToOne: false
            referencedRelation: "language_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_language_skills_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_permissions_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_specializations: {
        Row: {
          created_at: string
          id: string
          specialization_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          specialization_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          specialization_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_specializations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "expert_team_members"
            referencedColumns: ["id"]
          },
        ]
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
      expert_type: "individual" | "company"
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
      expert_type: ["individual", "company"],
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
