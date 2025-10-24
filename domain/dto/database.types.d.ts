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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      backup_categories: {
        Row: {
          classification: string | null
          created_at: string | null
          family_id: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      backup_expenses: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          family_id: string | null
          id: string | null
          receipt_url: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          family_id?: string | null
          id?: string | null
          receipt_url?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          family_id?: string | null
          id?: string | null
          receipt_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_families: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      backup_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          family_id: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          family_id?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          family_id?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          created_at: string | null
          desejos_budget: number
          family_id: string | null
          id: string
          month: number
          necessidades_budget: number
          poupanca_budget: number
          total_income: number
          year: number
        }
        Insert: {
          created_at?: string | null
          desejos_budget?: number
          family_id?: string | null
          id?: string
          month: number
          necessidades_budget?: number
          poupanca_budget?: number
          total_income?: number
          year: number
        }
        Update: {
          created_at?: string | null
          desejos_budget?: number
          family_id?: string | null
          id?: string
          month?: number
          necessidades_budget?: number
          poupanca_budget?: number
          total_income?: number
          year?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          classification: string
          created_at: string | null
          family_id: string | null
          id: string
          name: string
        }
        Insert: {
          classification: string
          created_at?: string | null
          family_id?: string | null
          id?: string
          name: string
        }
        Update: {
          classification?: string
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string | null
          family_id: string | null
          id: string
          installment_number: number | null
          installment_value: number | null
          is_installment: boolean | null
          is_recurring: boolean | null
          parent_expense_id: string | null
          receipt_url: string | null
          recurrence_type: string | null
          total_installments: number | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          family_id?: string | null
          id?: string
          installment_number?: number | null
          installment_value?: number | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          parent_expense_id?: string | null
          receipt_url?: string | null
          recurrence_type?: string | null
          total_installments?: number | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          family_id?: string | null
          id?: string
          installment_number?: number | null
          installment_value?: number | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          parent_expense_id?: string | null
          receipt_url?: string | null
          recurrence_type?: string | null
          total_installments?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_parent_expense_id_fkey"
            columns: ["parent_expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string | null
          email: string
          family_id: string | null
          id: string
          invited_by: string | null
          role_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          family_id?: string | null
          id?: string
          invited_by?: string | null
          role_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          family_id?: string | null
          id?: string
          invited_by?: string | null
          role_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "family_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_roles: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          family_id: string
          id: string
          name: string
          permissions: string[]
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          family_id: string
          id?: string
          name: string
          permissions?: string[]
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          family_id?: string
          id?: string
          name?: string
          permissions?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_roles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      incomes: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          family_id: string | null
          frequency: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description?: string | null
          family_id?: string | null
          frequency?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          family_id?: string | null
          frequency?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          annual_return_rate: number
          created_at: string | null
          current_amount: number
          family_id: string | null
          id: string
          initial_amount: number
          monthly_contribution: number | null
          name: string
          start_date: string
          type: string
        }
        Insert: {
          annual_return_rate: number
          created_at?: string | null
          current_amount: number
          family_id?: string | null
          id?: string
          initial_amount: number
          monthly_contribution?: number | null
          name: string
          start_date: string
          type: string
        }
        Update: {
          annual_return_rate?: number
          created_at?: string | null
          current_amount?: number
          family_id?: string | null
          id?: string
          initial_amount?: number
          monthly_contribution?: number | null
          name?: string
          start_date?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          family_id: string | null
          id: string
          name: string
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          family_id?: string | null
          id: string
          name: string
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          family_id?: string | null
          id?: string
          name?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "family_roles"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
