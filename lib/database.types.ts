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
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          subcategory: string | null
          location: 'Niederlauterbach' | 'Benissa'
          type: 'Abfahrt' | 'Abflug' | 'Vor Ort' | 'Reise'
          scenario: string
          done: boolean
          order: number
          link: string | null
          image_url: string | null
          image_urls: string[] | null
          notes: string | null
          transport_type: 'Auto' | 'Flugzeug' | 'Nicht zutreffend' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          subcategory?: string | null
          location: 'Niederlauterbach' | 'Benissa'
          type: 'Abfahrt' | 'Abflug' | 'Vor Ort' | 'Reise'
          scenario: string
          done?: boolean
          order: number
          link?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          notes?: string | null
          transport_type?: 'Auto' | 'Flugzeug' | 'Nicht zutreffend' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          location?: 'Niederlauterbach' | 'Benissa'
          type?: 'Abfahrt' | 'Abflug' | 'Vor Ort' | 'Reise'
          scenario?: string
          done?: boolean
          order?: number
          link?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          notes?: string | null
          transport_type?: 'Auto' | 'Flugzeug' | 'Nicht zutreffend' | null
          created_at?: string
          updated_at?: string
        }
      }
      user_task_status: {
        Row: {
          id: string
          user_id: string
          task_id: string
          done: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          done?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          done?: boolean
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
      [_ in never]: never
    }
  }
}

