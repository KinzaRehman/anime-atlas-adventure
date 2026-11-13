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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      anime_deck_cards: {
        Row: {
          anime_key: string
          character_name: string
          created_at: string
          description: string
          id: string
          rating: number
          rewatch: boolean
          shared: boolean
          title: string
          user_id: string
        }
        Insert: {
          anime_key: string
          character_name?: string
          created_at?: string
          description?: string
          id?: string
          rating: number
          rewatch?: boolean
          shared?: boolean
          title: string
          user_id: string
        }
        Update: {
          anime_key?: string
          character_name?: string
          created_at?: string
          description?: string
          id?: string
          rating?: number
          rewatch?: boolean
          shared?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_deck_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anime_franchise_favorites: {
        Row: {
          created_at: string
          franchise_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          franchise_id: number
          user_id?: string
        }
        Update: {
          created_at?: string
          franchise_id?: number
          user_id?: string
        }
        Relationships: []
      }
      anime_installment_progress: {
        Row: {
          completed_at: string | null
          episodes_watched: number
          franchise_id: number
          installment_id: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          episodes_watched?: number
          franchise_id: number
          installment_id: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          episodes_watched?: number
          franchise_id?: number
          installment_id?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          character: string
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          character: string
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          character?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_test: boolean
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_test?: boolean
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_test?: boolean
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_hidden: {
        Row: {
          created_at: string
          moderator_id: string
          target_id: string
          target_kind: string
        }
        Insert: {
          created_at?: string
          moderator_id: string
          target_id: string
          target_kind: string
        }
        Update: {
          created_at?: string
          moderator_id?: string
          target_id?: string
          target_kind?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          read_at: string | null
          target_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          message: string
          read_at?: string | null
          target_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          read_at?: string | null
          target_id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id?: string
          status?: string
          target_id: string
          target_kind: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_kind?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          id: string
          options: string[]
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          options: string[]
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: string[]
          question?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          fandom: string
          id: string
          is_test: boolean
          spoiler: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          fandom?: string
          id?: string
          is_test?: boolean
          spoiler?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          fandom?: string
          id?: string
          is_test?: boolean
          spoiler?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      sim_events: {
        Row: {
          created_at: string
          detail: Json
          error: string | null
          id: string
          kind: string
          ok: boolean
          seq: number
          sim_at: string
          sim_day: number
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          error?: string | null
          id?: string
          kind: string
          ok?: boolean
          seq: number
          sim_at: string
          sim_day: number
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          error?: string | null
          id?: string
          kind?: string
          ok?: boolean
          seq?: number
          sim_at?: string
          sim_day?: number
          user_id?: string
        }
        Relationships: []
      }
      sim_sessions: {
        Row: {
          actions: number
          duration_s: number
          id: string
          sim_day: number
          started_at: string
          user_id: string
        }
        Insert: {
          actions?: number
          duration_s: number
          id?: string
          sim_day: number
          started_at: string
          user_id: string
        }
        Update: {
          actions?: number
          duration_s?: number
          id?: string
          sim_day?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sim_state: {
        Row: {
          ai_budget: number
          ai_used: number
          epoch: string
          id: number
          paused: boolean
          sim_day: number
          updated_at: string
        }
        Insert: {
          ai_budget?: number
          ai_used?: number
          epoch?: string
          id?: number
          paused?: boolean
          sim_day?: number
          updated_at?: string
        }
        Update: {
          ai_budget?: number
          ai_used?: number
          epoch?: string
          id?: number
          paused?: boolean
          sim_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      sim_test_results: {
        Row: {
          area: string
          created_at: string
          detail: string
          id: string
          name: string
          sim_day: number
          status: string
        }
        Insert: {
          area: string
          created_at?: string
          detail?: string
          id?: string
          name: string
          sim_day?: number
          status: string
        }
        Update: {
          area?: string
          created_at?: string
          detail?: string
          id?: string
          name?: string
          sim_day?: number
          status?: string
        }
        Relationships: []
      }
      sim_tokens: {
        Row: {
          access_token: string | null
          expires_at: string | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: string | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          expires_at?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sim_users: {
        Row: {
          archetype: string
          created_at: string
          display_name: string
          email: string
          handle: string
          joined_day: number
          last_active_day: number | null
          persona: Json
          progress: Json
          relationships: Json
          user_id: string
        }
        Insert: {
          archetype: string
          created_at?: string
          display_name: string
          email: string
          handle: string
          joined_day?: number
          last_active_day?: number | null
          persona?: Json
          progress?: Json
          relationships?: Json
          user_id: string
        }
        Update: {
          archetype?: string
          created_at?: string
          display_name?: string
          email?: string
          handle?: string
          joined_day?: number
          last_active_day?: number | null
          persona?: Json
          progress?: Json
          relationships?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_community_hidden: {
        Args: { _id: string; _kind: string }
        Returns: boolean
      }
      is_community_moderator: { Args: never; Returns: boolean }
      is_public_profile: { Args: { _uid: string }; Returns: boolean }
      is_sim_admin: { Args: never; Returns: boolean }
      is_test_user: { Args: { uid: string }; Returns: boolean }
      poll_vote_counts: {
        Args: { _poll_id: string }
        Returns: {
          option_index: number
          votes: number
        }[]
      }
      resolve_community_report: {
        Args: { decision: string; report_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
