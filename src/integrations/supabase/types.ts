/**
 * Supabase TypeScript types for NeuroSpeak.
 *
 * This file was hand-authored to match database.sql.
 *
 * TO REGENERATE AUTOMATICALLY after connecting your Supabase project:
 *   npx supabase gen types typescript --project-id <your-ref> \
 *     > src/integrations/supabase/types.ts
 *
 * Until then, this file gives the typed client full awareness of
 * all tables, enums, and their row/insert/update shapes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------------------
// ENUM TYPES
// ---------------------------------------------------------------------------
export type UserRole           = "user" | "caregiver";
export type RelationshipStatus = "pending" | "accepted" | "declined" | "revoked";
export type MessageStatus      = "sent" | "delivered" | "read";
export type SosStatus          = "active" | "cancelled" | "resolved";
export type NotificationType   = "emergency" | "message" | "alert" | "health" | "system";
export type AlertLevel         = "info" | "warning" | "critical";

// ---------------------------------------------------------------------------
// DATABASE SCHEMA
// ---------------------------------------------------------------------------
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      // ── profiles ──────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id:            string           // uuid
          role:          UserRole
          full_name:     string | null
          email:         string | null
          avatar_url:    string | null
          date_of_birth: string | null    // ISO date string
          diagnosis:     string | null
          language:      string
          speech_rate:   number
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id:            string
          role?:         UserRole
          full_name?:    string | null
          email?:        string | null
          avatar_url?:   string | null
          date_of_birth?: string | null
          diagnosis?:    string | null
          language?:     string
          speech_rate?:  number
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          role?:         UserRole
          full_name?:    string | null
          email?:        string | null
          avatar_url?:   string | null
          date_of_birth?: string | null
          diagnosis?:    string | null
          language?:     string
          speech_rate?:  number
          updated_at?:   string
        }
      }

      // ── caregiver_patient ─────────────────────────────────────────────────
      caregiver_patient: {
        Row: {
          id:           string
          caregiver_id: string
          patient_id:   string
          status:       RelationshipStatus
          invited_at:   string
          accepted_at:  string | null
        }
        Insert: {
          id?:          string
          caregiver_id: string
          patient_id:   string
          status?:      RelationshipStatus
          invited_at?:  string
          accepted_at?: string | null
        }
        Update: {
          status?:      RelationshipStatus
          accepted_at?: string | null
        }
      }

      // ── emergency_contacts ────────────────────────────────────────────────
      emergency_contacts: {
        Row: {
          id:         string
          user_id:    string
          name:       string
          phone:      string
          relation:   string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?:        string
          user_id:    string
          name:       string
          phone:      string
          relation?:  string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?:      string
          phone?:     string
          relation?:  string | null
          sort_order?: number
        }
      }

      // ── conversations ─────────────────────────────────────────────────────
      conversations: {
        Row: {
          id:           string
          patient_id:   string
          caregiver_id: string
          created_at:   string
        }
        Insert: {
          id?:          string
          patient_id:   string
          caregiver_id: string
          created_at?:  string
        }
        Update: Record<string, never>   // immutable after creation
      }

      // ── messages ──────────────────────────────────────────────────────────
      messages: {
        Row: {
          id:              string
          conversation_id: string
          sender_id:       string
          content:         string
          status:          MessageStatus
          created_at:      string
        }
        Insert: {
          id?:             string
          conversation_id: string
          sender_id:       string
          content:         string
          status?:         MessageStatus
          created_at?:     string
        }
        Update: {
          status?: MessageStatus
        }
      }

      // ── notifications ─────────────────────────────────────────────────────
      notifications: {
        Row: {
          id:          string
          user_id:     string
          type:        NotificationType
          title:       string
          body:        string
          read:        boolean
          entity_type: string | null
          entity_id:   string | null
          created_at:  string
        }
        Insert: {
          id?:         string
          user_id:     string
          type:        NotificationType
          title:       string
          body:        string
          read?:       boolean
          entity_type?: string | null
          entity_id?:  string | null
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }

      // ── sos_events ────────────────────────────────────────────────────────
      sos_events: {
        Row: {
          id:           string
          patient_id:   string
          status:       SosStatus
          latitude:     number | null
          longitude:    number | null
          triggered_at: string
          resolved_at:  string | null
          cancelled_at: string | null
        }
        Insert: {
          id?:          string
          patient_id:   string
          status?:      SosStatus
          latitude?:    number | null
          longitude?:   number | null
          triggered_at?: string
          resolved_at?:  string | null
          cancelled_at?: string | null
        }
        Update: {
          status?:      SosStatus
          resolved_at?: string | null
          cancelled_at?: string | null
        }
      }

      // ── alerts ────────────────────────────────────────────────────────────
      alerts: {
        Row: {
          id:           string
          patient_id:   string
          caregiver_id: string | null
          level:        AlertLevel
          title:        string
          description:  string | null
          read:         boolean
          created_at:   string
        }
        Insert: {
          id?:          string
          patient_id:   string
          caregiver_id?: string | null
          level?:        AlertLevel
          title:         string
          description?:  string | null
          read?:         boolean
          created_at?:   string
        }
        Update: {
          read?: boolean
        }
      }

      // ── live_locations ────────────────────────────────────────────────────
      live_locations: {
        Row: {
          patient_id: string
          latitude:   number
          longitude:  number
          accuracy:   number | null
          speed:      number | null
          heading:    number | null
          updated_at: string
        }
        Insert: {
          patient_id: string
          latitude:   number
          longitude:  number
          accuracy?:  number | null
          speed?:     number | null
          heading?:   number | null
          updated_at?: string
        }
        Update: {
          latitude?:  number
          longitude?: number
          accuracy?:  number | null
          speed?:     number | null
          heading?:   number | null
          updated_at?: string
        }
      }

      // ── safe_zones ────────────────────────────────────────────────────────
      safe_zones: {
        Row: {
          id:         string
          patient_id: string
          name:       string
          latitude:   number
          longitude:  number
          radius_m:   number
          active:     boolean
          created_at: string
        }
        Insert: {
          id?:        string
          patient_id: string
          name:       string
          latitude:   number
          longitude:  number
          radius_m?:  number
          active?:    boolean
          created_at?: string
        }
        Update: {
          name?:     string
          radius_m?: number
          active?:   boolean
        }
      }


      // ── app_settings ──────────────────────────────────────────────────────
      app_settings: {
        Row: {
          user_id:         string
          dark_mode:       boolean
          font_size:       number
          haptics_enabled: boolean
          updated_at:      string
        }
        Insert: {
          user_id:          string
          dark_mode?:       boolean
          font_size?:       number
          haptics_enabled?: boolean
          updated_at?:      string
        }
        Update: {
          dark_mode?:       boolean
          font_size?:       number
          haptics_enabled?: boolean
          updated_at?:      string
        }
      }

      // ── connection_requests ───────────────────────────────────────────────
      // Communication-only contact discovery. SEPARATE from caregiver_patient.
      // Accepting a connection_request does NOT grant caregiver access.
      connection_requests: {
        Row: {
          id:           string
          requester_id: string
          recipient_id: string
          status:       "pending" | "accepted" | "rejected" | "cancelled"
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:          string
          requester_id: string
          recipient_id: string
          status?:      "pending" | "accepted" | "rejected" | "cancelled"
          created_at?:  string
          updated_at?:  string
        }
        Update: {
          // Ownership fields (requester_id, recipient_id) are immutable after insert.
          // Only status and updated_at may be changed.
          status?:     "accepted" | "rejected" | "cancelled"
          updated_at?: string
        }
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      user_role:            UserRole
      relationship_status:  RelationshipStatus
      message_status:       MessageStatus
      sos_status:           SosStatus
      notification_type:    NotificationType
      alert_level:          AlertLevel
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ---------------------------------------------------------------------------
// UTILITY TYPES (re-exported from the generated pattern)
// ---------------------------------------------------------------------------
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

export const Constants = {
  public: {
    Enums: {
      user_role:           ["user", "caregiver"],
      relationship_status: ["pending", "accepted", "declined", "revoked"],
      message_status:      ["sent", "delivered", "read"],
      sos_status:          ["active", "cancelled", "resolved"],
      notification_type:   ["emergency", "message", "alert", "health", "system"],
      alert_level:         ["info", "warning", "critical"],
    },
  },
} as const
