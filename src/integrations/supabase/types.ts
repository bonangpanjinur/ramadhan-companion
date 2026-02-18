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
      activation_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["code_status"] | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["code_status"] | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["code_status"] | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      daily_ibadah: {
        Row: {
          ashar: boolean | null
          buka_tepat_waktu: boolean | null
          created_at: string | null
          dhuha: boolean | null
          dzuhur: boolean | null
          id: string
          isya: boolean | null
          maghrib: boolean | null
          rawatib: boolean | null
          sahur: boolean | null
          subuh: boolean | null
          tadarus: boolean | null
          tahajud: boolean | null
          tanggal: string
          updated_at: string | null
          user_id: string
          witir: boolean | null
        }
        Insert: {
          ashar?: boolean | null
          buka_tepat_waktu?: boolean | null
          created_at?: string | null
          dhuha?: boolean | null
          dzuhur?: boolean | null
          id?: string
          isya?: boolean | null
          maghrib?: boolean | null
          rawatib?: boolean | null
          sahur?: boolean | null
          subuh?: boolean | null
          tadarus?: boolean | null
          tahajud?: boolean | null
          tanggal: string
          updated_at?: string | null
          user_id: string
          witir?: boolean | null
        }
        Update: {
          ashar?: boolean | null
          buka_tepat_waktu?: boolean | null
          created_at?: string | null
          dhuha?: boolean | null
          dzuhur?: boolean | null
          id?: string
          isya?: boolean | null
          maghrib?: boolean | null
          rawatib?: boolean | null
          sahur?: boolean | null
          subuh?: boolean | null
          tadarus?: boolean | null
          tahajud?: boolean | null
          tanggal?: string
          updated_at?: string | null
          user_id?: string
          witir?: boolean | null
        }
        Relationships: []
      }
      doa_bookmarks: {
        Row: {
          created_at: string | null
          doa_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doa_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          doa_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doa_bookmarks_doa_id_fkey"
            columns: ["doa_id"]
            isOneToOne: false
            referencedRelation: "doa_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      doa_collection: {
        Row: {
          arab: string
          created_at: string | null
          id: string
          judul: string
          kategori: string | null
          latin: string
          terjemahan: string
          updated_at: string | null
          urutan: number | null
        }
        Insert: {
          arab: string
          created_at?: string | null
          id?: string
          judul: string
          kategori?: string | null
          latin: string
          terjemahan: string
          updated_at?: string | null
          urutan?: number | null
        }
        Update: {
          arab?: string
          created_at?: string | null
          id?: string
          judul?: string
          kategori?: string | null
          latin?: string
          terjemahan?: string
          updated_at?: string | null
          urutan?: number | null
        }
        Relationships: []
      }
      health_tracker: {
        Row: {
          created_at: string | null
          gelas_air: number | null
          id: string
          jam_tidur: number | null
          makan_buah: boolean | null
          olahraga: boolean | null
          tanggal: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gelas_air?: number | null
          id?: string
          jam_tidur?: number | null
          makan_buah?: boolean | null
          olahraga?: boolean | null
          tanggal: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gelas_air?: number | null
          id?: string
          jam_tidur?: number | null
          makan_buah?: boolean | null
          olahraga?: boolean | null
          tanggal?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      juz_progress: {
        Row: {
          id: string
          juz_number: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          juz_number: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          juz_number?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          premium_activated_at: string | null
          premium_status: Database["public"]["Enums"]["premium_status"] | null
          quran_target: number | null
          ramadhan_day: number | null
          sedekah_target: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          premium_activated_at?: string | null
          premium_status?: Database["public"]["Enums"]["premium_status"] | null
          quran_target?: number | null
          ramadhan_day?: number | null
          sedekah_target?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          premium_activated_at?: string | null
          premium_status?: Database["public"]["Enums"]["premium_status"] | null
          quran_target?: number | null
          ramadhan_day?: number | null
          sedekah_target?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          created_at: string | null
          halaman_dibaca: number | null
          id: string
          tanggal: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          halaman_dibaca?: number | null
          id?: string
          tanggal: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          halaman_dibaca?: number | null
          id?: string
          tanggal?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadhan_settings: {
        Row: {
          city: string | null
          created_at: string | null
          onboarding_done: boolean | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          onboarding_done?: boolean | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          onboarding_done?: boolean | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sedekah_log: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          nominal: number
          tanggal: string | null
          user_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          nominal: number
          tanggal?: string | null
          user_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          nominal?: number
          tanggal?: string | null
          user_id?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
      code_status: "available" | "used"
      premium_status: "free" | "premium"
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
      app_role: ["admin", "user"],
      code_status: ["available", "used"],
      premium_status: ["free", "premium"],
    },
  },
} as const
