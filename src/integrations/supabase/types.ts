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
      certifications: {
        Row: {
          badge_color: string | null
          category: string | null
          id: string
          issued_at: string
          issuer: string | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          badge_color?: string | null
          category?: string | null
          id?: string
          issued_at?: string
          issuer?: string | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          badge_color?: string | null
          category?: string | null
          id?: string
          issued_at?: string
          issuer?: string | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string
          id: string
          quiz_score: number | null
          rating: number | null
          review: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string
          id?: string
          quiz_score?: number | null
          rating?: number | null
          review?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string
          id?: string
          quiz_score?: number | null
          rating?: number | null
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["proficiency_level"] | null
          duration_hours: number | null
          enrollment_count: number | null
          id: string
          industry_alignment_score: number | null
          instructor_name: string | null
          metadata: Json | null
          platform: string
          rating: number | null
          skills_covered: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          duration_hours?: number | null
          enrollment_count?: number | null
          id?: string
          industry_alignment_score?: number | null
          instructor_name?: string | null
          metadata?: Json | null
          platform: string
          rating?: number | null
          skills_covered?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          duration_hours?: number | null
          enrollment_count?: number | null
          id?: string
          industry_alignment_score?: number | null
          instructor_name?: string | null
          metadata?: Json | null
          platform?: string
          rating?: number | null
          skills_covered?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_goal: string | null
          created_at: string
          full_name: string | null
          id: string
          interests: string[] | null
          learning_pace: string | null
          learning_style: Database["public"]["Enums"]["learning_style"] | null
          preferred_languages: string[] | null
          prior_experience: string | null
          target_industry: string | null
          updated_at: string
          user_id: string
          weekly_hours: number | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_goal?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          preferred_languages?: string[] | null
          prior_experience?: string | null
          target_industry?: string | null
          updated_at?: string
          user_id: string
          weekly_hours?: number | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_goal?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          preferred_languages?: string[] | null
          prior_experience?: string | null
          target_industry?: string | null
          updated_at?: string
          user_id?: string
          weekly_hours?: number | null
          years_experience?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          dataset_url: string | null
          deliverables: string[] | null
          description: string | null
          difficulty: Database["public"]["Enums"]["proficiency_level"] | null
          domain: string
          estimated_hours: number | null
          id: string
          industry_relevance: number | null
          problem_statement: string | null
          skills_required: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          dataset_url?: string | null
          deliverables?: string[] | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          domain: string
          estimated_hours?: number | null
          id?: string
          industry_relevance?: number | null
          problem_statement?: string | null
          skills_required?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          dataset_url?: string | null
          deliverables?: string[] | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          domain?: string
          estimated_hours?: number | null
          id?: string
          industry_relevance?: number | null
          problem_statement?: string | null
          skills_required?: string[] | null
          title?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string
          feedback: string | null
          id: string
          new_proficiency:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          quiz_id: string
          score: number
          skill_id: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          new_proficiency?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          quiz_id: string
          score?: number
          skill_id?: string | null
          total_questions?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          new_proficiency?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          quiz_id?: string
          score?: number
          skill_id?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["proficiency_level"] | null
          id: string
          questions: Json
          skill_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          id?: string
          questions?: Json
          skill_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["proficiency_level"] | null
          id?: string
          questions?: Json
          skill_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          course_id: string
          created_at: string
          ialps_score: number | null
          id: string
          is_active: boolean | null
          reason: string | null
          score: number | null
          sequence_order: number | null
          skill_gaps_addressed: string[] | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          ialps_score?: number | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          score?: number | null
          sequence_order?: number | null
          skill_gaps_addressed?: string[] | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          ialps_score?: number | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          score?: number | null
          sequence_order?: number | null
          skill_gaps_addressed?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          industry_relevance: number | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry_relevance?: number | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry_relevance?: number | null
          name?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          completed_at: string | null
          id: string
          notes: string | null
          progress: number | null
          project_id: string
          started_at: string
          status: string
          submission_url: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          project_id: string
          started_at?: string
          status?: string
          submission_url?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          project_id?: string
          started_at?: string
          status?: string
          submission_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          confidence_score: number | null
          id: string
          proficiency: Database["public"]["Enums"]["proficiency_level"] | null
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          id?: string
          proficiency?: Database["public"]["Enums"]["proficiency_level"] | null
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          id?: string
          proficiency?: Database["public"]["Enums"]["proficiency_level"] | null
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "student" | "instructor"
      learning_style: "visual" | "reading" | "hands_on" | "video" | "mixed"
      proficiency_level: "beginner" | "intermediate" | "advanced"
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
      app_role: ["admin", "student", "instructor"],
      learning_style: ["visual", "reading", "hands_on", "video", "mixed"],
      proficiency_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
