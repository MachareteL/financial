export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      budget_categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          percentage: number;
          team_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          percentage?: number;
          team_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          percentage?: number;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_categories_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          created_at: string;
          id: string;
          month: number;
          team_id: string | null;
          total_income: number;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          month: number;
          team_id?: string | null;
          total_income?: number;
          year: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          month?: number;
          team_id?: string | null;
          total_income?: number;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          budget_category_id: string;
          created_at: string;
          id: string;
          name: string;
          team_id: string | null;
        };
        Insert: {
          budget_category_id: string;
          created_at?: string;
          id?: string;
          name: string;
          team_id?: string | null;
        };
        Update: {
          budget_category_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          team_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_budget_category_id_fkey";
            columns: ["budget_category_id"];
            isOneToOne: false;
            referencedRelation: "budget_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "categories_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string;
          date: string;
          description: string | null;
          id: string;
          installment_number: number | null;
          installment_value: number | null;
          is_installment: boolean | null;
          is_recurring: boolean | null;
          parent_expense_id: string | null;
          receipt_url: string | null;
          recurrence_type: string | null;
          team_id: string | null;
          total_installments: number | null;
          user_id: string | null;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string;
          date: string;
          description?: string | null;
          id?: string;
          installment_number?: number | null;
          installment_value?: number | null;
          is_installment?: boolean | null;
          is_recurring?: boolean | null;
          parent_expense_id?: string | null;
          receipt_url?: string | null;
          recurrence_type?: string | null;
          team_id?: string | null;
          total_installments?: number | null;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string;
          date?: string;
          description?: string | null;
          id?: string;
          installment_number?: number | null;
          installment_value?: number | null;
          is_installment?: boolean | null;
          is_recurring?: boolean | null;
          parent_expense_id?: string | null;
          receipt_url?: string | null;
          recurrence_type?: string | null;
          team_id?: string | null;
          total_installments?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_parent_expense_id_fkey";
            columns: ["parent_expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feedbacks: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string;
          id: string;
          status: string;
          title: string;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description: string;
          id?: string;
          status?: string;
          title: string;
          type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string;
          id?: string;
          status?: string;
          title?: string;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      incomes: {
        Row: {
          amount: number;
          created_at: string;
          date: string;
          description: string | null;
          frequency: string | null;
          id: string;
          team_id: string | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          date: string;
          description?: string | null;
          frequency?: string | null;
          id?: string;
          team_id?: string | null;
          type: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          date?: string;
          description?: string | null;
          frequency?: string | null;
          id?: string;
          team_id?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "incomes_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incomes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      insights: {
        Row: {
          action_url: string | null;
          content: string;
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          team_id: string;
          title: string;
          type: Database["public"]["Enums"]["insight_type"];
        };
        Insert: {
          action_url?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          team_id: string;
          title: string;
          type: Database["public"]["Enums"]["insight_type"];
        };
        Update: {
          action_url?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          team_id?: string;
          title?: string;
          type?: Database["public"]["Enums"]["insight_type"];
        };
        Relationships: [
          {
            foreignKeyName: "insights_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      investments: {
        Row: {
          annual_return_rate: number;
          created_at: string;
          current_amount: number;
          id: string;
          initial_amount: number;
          monthly_contribution: number | null;
          name: string;
          start_date: string;
          team_id: string | null;
          type: string;
        };
        Insert: {
          annual_return_rate: number;
          created_at?: string;
          current_amount: number;
          id?: string;
          initial_amount: number;
          monthly_contribution?: number | null;
          name: string;
          start_date: string;
          team_id?: string | null;
          type: string;
        };
        Update: {
          annual_return_rate?: number;
          created_at?: string;
          current_amount?: number;
          id?: string;
          initial_amount?: number;
          monthly_contribution?: number | null;
          name?: string;
          start_date?: string;
          team_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investments_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      quiz_sessions: {
        Row: {
          answers_p1: Json | null;
          answers_p2: Json | null;
          created_at: string;
          current_question_index: number | null;
          id: string;
          player_1_id: string | null;
          player_2_id: string | null;
          result_p1: string | null;
          result_p2: string | null;
          status: string | null;
        };
        Insert: {
          answers_p1?: Json | null;
          answers_p2?: Json | null;
          created_at?: string;
          current_question_index?: number | null;
          id?: string;
          player_1_id?: string | null;
          player_2_id?: string | null;
          result_p1?: string | null;
          result_p2?: string | null;
          status?: string | null;
        };
        Update: {
          answers_p1?: Json | null;
          answers_p2?: Json | null;
          created_at?: string;
          current_question_index?: number | null;
          id?: string;
          player_1_id?: string | null;
          player_2_id?: string | null;
          result_p1?: string | null;
          result_p2?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          count: number;
          team_id: string;
          window_start: string;
        };
        Insert: {
          count?: number;
          team_id: string;
          window_start?: string;
        };
        Update: {
          count?: number;
          team_id?: string;
          window_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rate_limits_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: true;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          external_customer_id: string;
          external_id: string;
          gateway_id: string;
          id: string;
          plan_id: string | null;
          status: string;
          team_id: string;
          updated_at: string | null;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          external_customer_id: string;
          external_id: string;
          gateway_id: string;
          id?: string;
          plan_id?: string | null;
          status: string;
          team_id: string;
          updated_at?: string | null;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          external_customer_id?: string;
          external_id?: string;
          gateway_id?: string;
          id?: string;
          plan_id?: string | null;
          status?: string;
          team_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_invites: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          invited_by: string | null;
          role_id: string | null;
          status: string;
          team_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          invited_by?: string | null;
          role_id?: string | null;
          status?: string;
          team_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          invited_by?: string | null;
          role_id?: string | null;
          status?: string;
          team_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_invites_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "team_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_invites_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          created_at: string | null;
          profile_id: string;
          role_id: string;
          team_id: string;
        };
        Insert: {
          created_at?: string | null;
          profile_id: string;
          role_id: string;
          team_id: string;
        };
        Update: {
          created_at?: string | null;
          profile_id?: string;
          role_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_team_members_role_id";
            columns: ["role_id", "team_id"];
            isOneToOne: false;
            referencedRelation: "team_roles";
            referencedColumns: ["id", "team_id"];
          },
          {
            foreignKeyName: "team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_roles: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          permissions: string[];
          team_id: string;
          updated_at: string | null;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          permissions?: string[];
          team_id: string;
          updated_at?: string | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          permissions?: string[];
          team_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_roles_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          trial_ends_at: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          trial_ends_at?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          trial_ends_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth_user_team_ids: { Args: never; Returns: string[] };
      get_auth_user_teams: { Args: never; Returns: string[] };
      get_my_teams: { Args: never; Returns: string[] };
      has_pending_invite: { Args: { check_team_id: string }; Returns: boolean };
      is_team_owner: { Args: { check_team_id: string }; Returns: boolean };
    };
    Enums: {
      insight_type: "WEEKLY_REPORT" | "BUDGET_ALERT" | "INVESTMENT_TIP";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      insight_type: ["WEEKLY_REPORT", "BUDGET_ALERT", "INVESTMENT_TIP"],
    },
  },
} as const;
