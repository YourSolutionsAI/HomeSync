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
      contacts: {
        Row: {
          id: string
          name: string
          role: string
          location: 'Niederlauterbach' | 'Benissa'
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          location: 'Niederlauterbach' | 'Benissa'
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          location?: 'Niederlauterbach' | 'Benissa'
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
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
  }
}

