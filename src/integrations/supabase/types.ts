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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      live_mode: {
        Row: {
          id: number
          is_live: boolean
          match_id: string | null
          stream_url: string | null
          team_a_score: number | null
          team_b_score: number | null
        }
        Insert: {
          id?: number
          is_live?: boolean
          match_id?: string | null
          stream_url?: string | null
          team_a_score?: number | null
          team_b_score?: number | null
        }
        Update: {
          id?: number
          is_live?: boolean
          match_id?: string | null
          stream_url?: string | null
          team_a_score?: number | null
          team_b_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_mode_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_goals: {
        Row: {
          assist: string | null
          id: string
          match_id: string
          scorer: string
          team: string
          time: string
        }
        Insert: {
          assist?: string | null
          id?: string
          match_id: string
          scorer: string
          team: string
          time: string
        }
        Update: {
          assist?: string | null
          id?: string
          match_id?: string
          scorer?: string
          team?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_goals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_date: string
          match_time: string
          mvp: string | null
          season: string
          status: string
          team_a_id: string | null
          team_a_score: number | null
          team_b_id: string | null
          team_b_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date: string
          match_time?: string
          mvp?: string | null
          season?: string
          status?: string
          team_a_id?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string
          match_time?: string
          mvp?: string | null
          season?: string
          status?: string
          team_a_id?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string
          content: string
          id: string
          image: string | null
          pinned: boolean
          published_at: string
          title: string
        }
        Insert: {
          author?: string
          content: string
          id?: string
          image?: string | null
          pinned?: boolean
          published_at?: string
          title: string
        }
        Update: {
          author?: string
          content?: string
          id?: string
          image?: string | null
          pinned?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          assists: number
          created_at: string
          gaa: number | null
          goals: number
          gp: number
          id: string
          jersey: number | null
          name: string
          pim: number
          plus_minus: number
          points: number
          position: string
          save_pct: number | null
          saves: number | null
          shutouts: number | null
          status: string
          team_id: string | null
        }
        Insert: {
          assists?: number
          created_at?: string
          gaa?: number | null
          goals?: number
          gp?: number
          id?: string
          jersey?: number | null
          name: string
          pim?: number
          plus_minus?: number
          points?: number
          position?: string
          save_pct?: number | null
          saves?: number | null
          shutouts?: number | null
          status?: string
          team_id?: string | null
        }
        Update: {
          assists?: number
          created_at?: string
          gaa?: number | null
          goals?: number
          gp?: number
          id?: string
          jersey?: number | null
          name?: string
          pim?: number
          plus_minus?: number
          points?: number
          position?: string
          save_pct?: number | null
          saves?: number | null
          shutouts?: number | null
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          display_name: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      standings: {
        Row: {
          ga: number
          gf: number
          gp: number
          id: string
          l: number
          ot: number
          pts: number
          team_id: string
          w: number
        }
        Insert: {
          ga?: number
          gf?: number
          gp?: number
          id?: string
          l?: number
          ot?: number
          pts?: number
          team_id: string
          w?: number
        }
        Update: {
          ga?: number
          gf?: number
          gp?: number
          id?: string
          l?: number
          ot?: number
          pts?: number
          team_id?: string
          w?: number
        }
        Relationships: [
          {
            foreignKeyName: "standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          abbreviation: string
          coach: string | null
          color: string
          created_at: string
          discord: string | null
          gm: string | null
          id: string
          name: string
        }
        Insert: {
          abbreviation: string
          coach?: string | null
          color?: string
          created_at?: string
          discord?: string | null
          gm?: string | null
          id?: string
          name: string
        }
        Update: {
          abbreviation?: string
          coach?: string | null
          color?: string
          created_at?: string
          discord?: string | null
          gm?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_team_manager: { Args: { _team_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "league_admin"
        | "general_manager"
        | "head_coach"
        | "player"
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
    Enums: {
      app_role: [
        "super_admin",
        "league_admin",
        "general_manager",
        "head_coach",
        "player",
      ],
    },
  },
} as const
