import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseInstance
}

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          family_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          family_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          family_id?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          classification: "necessidades" | "desejos" | "poupanca"
          family_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          classification: "necessidades" | "desejos" | "poupanca"
          family_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          classification?: "necessidades" | "desejos" | "poupanca"
          family_id?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          amount: number
          description: string | null
          date: string
          category_id: string
          family_id: string
          user_id: string
          receipt_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string | null
          date: string
          category_id: string
          family_id: string
          user_id: string
          receipt_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string | null
          date?: string
          category_id?: string
          family_id?: string
          user_id?: string
          receipt_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
