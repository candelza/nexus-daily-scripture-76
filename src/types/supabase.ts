export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prayer_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          date: string
          is_private: boolean
          care_group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          date: string
          is_private?: boolean
          care_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          date?: string
          is_private?: boolean
          care_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      care_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_care_groups: {
        Row: {
          id: string
          user_id: string
          care_group_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          care_group_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          care_group_id?: string
          role?: string
          created_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
