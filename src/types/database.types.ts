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
      rooms: {
        Row: {
          answers: Json[] | null
          callOffer: Json | null
          created_at: string
          iceCandidates: Json[] | null
          id: string
        }
        Insert: {
          answers?: Json[] | null
          callOffer?: Json | null
          created_at?: string
          iceCandidates?: Json[] | null
          id?: string
        }
        Update: {
          answers?: Json[] | null
          callOffer?: Json | null
          created_at?: string
          iceCandidates?: Json[] | null
          id?: string
        }
        Relationships: []
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
