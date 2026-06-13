/**
 * Auto-generated Supabase Database types.
 * Regenerate via Supabase MCP: generate_typescript_types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      disease: {
        Row: {
          ar_name: string | null
          description: string | null
          disease_id: number
          disease_name: string
          E_description: string | null
          threshold: number
          user_id: number | null
        }
        Insert: {
          ar_name?: string | null
          description?: string | null
          disease_id?: number
          disease_name: string
          E_description?: string | null
          threshold?: number
          user_id?: number | null
        }
        Update: {
          ar_name?: string | null
          description?: string | null
          disease_id?: number
          disease_name?: string
          E_description?: string | null
          threshold?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "disease_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      disease_symptom: {
        Row: {
          disease_id: number
          symptom_id: number
          weight: number | null
        }
        Insert: {
          disease_id: number
          symptom_id: number
          weight?: number | null
        }
        Update: {
          disease_id?: number
          symptom_id?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "disease_symptoms_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "disease"
            referencedColumns: ["disease_id"]
          },
          {
            foreignKeyName: "disease_symptoms_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom"
            referencedColumns: ["symptom_id"]
          },
        ]
      }
      governorate: {
        Row: {
          ar_name: string | null
          geom: unknown
          governorate_id: number
          governorate_name: string
          user_id: number | null
        }
        Insert: {
          ar_name?: string | null
          geom: unknown
          governorate_id?: number
          governorate_name: string
          user_id?: number | null
        }
        Update: {
          ar_name?: string | null
          geom?: unknown
          governorate_id?: number
          governorate_name?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governorate_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news: {
        Row: {
          content: string | null
          created_by: number | null
          image: string | null
          item_id: number
          publish_date: string
          title: string
          type: Database["public"]["Enums"]["news_category"]
        }
        Insert: {
          content?: string | null
          created_by?: number | null
          image?: string | null
          item_id?: number
          publish_date?: string
          title: string
          type: Database["public"]["Enums"]["news_category"]
        }
        Update: {
          content?: string | null
          created_by?: number | null
          image?: string | null
          item_id?: number
          publish_date?: string
          title?: string
          type?: Database["public"]["Enums"]["news_category"]
        }
        Relationships: [
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification: {
        Row: {
          created_at: string
          disease_id: number
          is_read: boolean | null
          message: string
          notification_id: number
        }
        Insert: {
          created_at?: string
          disease_id: number
          is_read?: boolean | null
          message: string
          notification_id?: number
        }
        Update: {
          created_at?: string
          disease_id?: number
          is_read?: boolean | null
          message?: string
          notification_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notification_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "disease"
            referencedColumns: ["disease_id"]
          },
        ]
      }
      report: {
        Row: {
          age: number | null
          classification_id: number | null
          disease_id: number | null
          gender: string | null
          governorate_id: number | null
          location: unknown
          notes: string | null
          onset_date: string | null
          patient_name: string
          phone: string | null
          report_date: string
          report_id: number
          tracking_number: string | null
          user_id: number
        }
        Insert: {
          age?: number | null
          classification_id?: number | null
          disease_id?: number | null
          gender?: string | null
          governorate_id?: number | null
          location?: unknown
          notes?: string | null
          onset_date?: string | null
          patient_name: string
          phone?: string | null
          report_date?: string
          report_id?: number
          tracking_number?: string | null
          user_id: number
        }
        Update: {
          age?: number | null
          classification_id?: number | null
          disease_id?: number | null
          gender?: string | null
          governorate_id?: number | null
          location?: unknown
          notes?: string | null
          onset_date?: string | null
          patient_name?: string
          phone?: string | null
          report_date?: string
          report_id?: number
          tracking_number?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "report_classification"
            referencedColumns: ["classification_id"]
          },
          {
            foreignKeyName: "report_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "disease"
            referencedColumns: ["disease_id"]
          },
          {
            foreignKeyName: "report_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorate"
            referencedColumns: ["governorate_id"]
          },
          {
            foreignKeyName: "report_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      report_classification: {
        Row: {
          case_classification: string
          classification_id: number
        }
        Insert: {
          case_classification: string
          classification_id?: number
        }
        Update: {
          case_classification?: string
          classification_id?: number
        }
        Relationships: []
      }
      report_history: {
        Row: {
          created_at: string
          id: number
          report_id: number
          report_status: Database["public"]["Enums"]["report_status_type"]
          updated_user_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          report_id: number
          report_status?: Database["public"]["Enums"]["report_status_type"]
          updated_user_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          report_id?: number
          report_status?: Database["public"]["Enums"]["report_status_type"]
          updated_user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "report_history_report_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["report_id"]
          },
          {
            foreignKeyName: "report_history_updated_user_id_fkey"
            columns: ["updated_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      symptom: {
        Row: {
          ar_name: string | null
          symptom_id: number
          symptom_name: string
        }
        Insert: {
          ar_name?: string | null
          symptom_id?: number
          symptom_name: string
        }
        Update: {
          ar_name?: string | null
          symptom_id?: number
          symptom_name?: string
        }
        Relationships: []
      }
      symptom_report: {
        Row: {
          report_id: number
          symptom_id: number
        }
        Insert: {
          report_id: number
          symptom_id: number
        }
        Update: {
          report_id?: number
          symptom_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "symptom_report_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["report_id"]
          },
          {
            foreignKeyName: "symptom_report_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom"
            referencedColumns: ["symptom_id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          password: string
          phone: string
          profile_picture: string | null
          role_id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          password: string
          phone: string
          profile_picture?: string | null
          role_id?: number
          user_id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          password?: string
          phone?: string
          profile_picture?: string | null
          role_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_role"
            referencedColumns: ["role_id"]
          },
        ]
      }
      user_role: {
        Row: {
          role_id: number
          role_name: string
        }
        Insert: {
          role_id?: number
          role_name: string
        }
        Update: {
          role_id?: number
          role_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_confirmed_reports: {
        Args: Record<PropertyKey, never>
        Returns: {
          disease_name: string
          governorate_name: string
          lat: number
          lng: number
          report_date: string
          report_id: number
        }[]
      }
    }
    Enums: {
      news_category: "urgent" | "alert" | "guideline" | "event"
      report_status_type:
        | "new"
        | "pending"
        | "resolved"
        | "verified"
        | "rejected"
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

export const Constants = {
  public: {
    Enums: {
      news_category: ["urgent", "alert", "guideline", "event"],
      report_status_type: ["new", "pending", "resolved", "verified", "rejected"],
    },
  },
} as const
