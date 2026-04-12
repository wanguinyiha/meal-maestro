
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      dietary_restrictions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      allergens: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string | null
          target: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon?: string | null
          target?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string | null
          target?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          bio: string | null
          avatar_url: string | null
          join_date: string
          current_streak: number
          total_meals_planned: number
          money_saved: number
          favorite_recipes_count: number
          last_active_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          bio?: string | null
          avatar_url?: string | null
          join_date?: string
          current_streak?: number
          total_meals_planned?: number
          money_saved?: number
          favorite_recipes_count?: number
          last_active_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          bio?: string | null
          avatar_url?: string | null
          join_date?: string
          current_streak?: number
          total_meals_planned?: number
          money_saved?: number
          favorite_recipes_count?: number
          last_active_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      dietary_preferences: {
        Row: {
          id: string
          user_id: string
          daily_calories: number | null
          protein_goal_g: number | null
          carb_goal_g: number | null
          fat_goal_g: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calories?: number | null
          protein_goal_g?: number | null
          carb_goal_g?: number | null
          fat_goal_g?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calories?: number | null
          protein_goal_g?: number | null
          carb_goal_g?: number | null
          fat_goal_g?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dietary_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_dietary_restrictions: {
        Row: {
          user_id: string
          restriction_id: string
        }
        Insert: {
          user_id: string
          restriction_id: string
        }
        Update: {
          user_id?: string
          restriction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dietary_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_dietary_restrictions_restriction_id_fkey"
            columns: ["restriction_id"]
            isOneToOne: false
            referencedRelation: "dietary_restrictions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_allergens: {
        Row: {
          user_id: string
          allergen_id: string
        }
        Insert: {
          user_id: string
          allergen_id: string
        }
        Update: {
          user_id?: string
          allergen_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_allergens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          meal_reminders: boolean
          grocery_reminders: boolean
          weekly_planning: boolean
          achievements: boolean
          marketing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_reminders?: boolean
          grocery_reminders?: boolean
          weekly_planning?: boolean
          achievements?: boolean
          marketing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_reminders?: boolean
          grocery_reminders?: boolean
          weekly_planning?: boolean
          achievements?: boolean
          marketing?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_preferences: {
        Row: {
          id: string
          user_id: string
          units: "imperial" | "metric"
          default_servings: number
          week_starts_on: "sunday" | "monday"
          theme: "light" | "dark" | "system"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          units?: "imperial" | "metric"
          default_servings?: number
          week_starts_on?: "sunday" | "monday"
          theme?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          units?: "imperial" | "metric"
          default_servings?: number
          week_starts_on?: "sunday" | "monday"
          theme?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          prep_time_min: number
          servings: number
          cost: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          difficulty: "easy" | "medium" | "hard"
          category: "breakfast" | "lunch" | "dinner"
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          prep_time_min: number
          servings: number
          cost: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          difficulty: "easy" | "medium" | "hard"
          category: "breakfast" | "lunch" | "dinner"
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          prep_time_min?: number
          servings?: number
          cost?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          difficulty?: "easy" | "medium" | "hard"
          category?: "breakfast" | "lunch" | "dinner"
          tags?: string[]
          created_at?: string
        }
        Relationships: []
      }
      external_recipes: {
        Row: {
          id: string
          external_source: string
          external_id: string
          title: string
          image_url: string | null
          raw_json: Json
          last_fetched_at: string
          created_at: string
        }
        Insert: {
          id?: string
          external_source: string
          external_id: string
          title: string
          image_url?: string | null
          raw_json: Json
          last_fetched_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          external_source?: string
          external_id?: string
          title?: string
          image_url?: string | null
          raw_json?: Json
          last_fetched_at?: string
          created_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          user_id: string
          recipe_id: string
        }
        Insert: {
          user_id: string
          recipe_id: string
        }
        Update: {
          user_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_external_favorites: {
        Row: {
          user_id: string
          external_recipe_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          external_recipe_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          external_recipe_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_external_favorites_external_recipe_id_fkey"
            columns: ["external_recipe_id"]
            isOneToOne: false
            referencedRelation: "external_recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      external_recipe_imports: {
        Row: {
          user_id: string
          external_source: string
          external_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          external_source: string
          external_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          external_source?: string
          external_id?: string
          recipe_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_recipe_imports_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      planned_meals: {
        Row: {
          id: string
          plan_id: string
          recipe_id: string
          day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          servings: number
        }
        Insert: {
          id?: string
          plan_id: string
          recipe_id: string
          day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          servings?: number
        }
        Update: {
          id?: string
          plan_id?: string
          recipe_id?: string
          day_of_week?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
          servings?: number
        }
        Relationships: [
          {
            foreignKeyName: "planned_meals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      grocery_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: string | null
          price: number
          category: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Grains & Pantry" | "Frozen" | "Beverages" | "Snacks" | "Other"
          checked: boolean
          plan_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity?: string | null
          price?: number
          category: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Grains & Pantry" | "Frozen" | "Beverages" | "Snacks" | "Other"
          checked?: boolean
          plan_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          quantity?: string | null
          price?: number
          category?: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Grains & Pantry" | "Frozen" | "Beverages" | "Snacks" | "Other"
          checked?: boolean
          plan_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      grocery_recipe_links: {
        Row: {
          grocery_id: string
          recipe_id: string
        }
        Insert: {
          grocery_id: string
          recipe_id: string
        }
        Update: {
          grocery_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_recipe_links_grocery_id_fkey"
            columns: ["grocery_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_recipe_links_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          earned_date: string | null
          progress: number
        }
        Insert: {
          user_id: string
          achievement_id: string
          earned_date?: string | null
          progress?: number
        }
        Update: {
          user_id?: string
          achievement_id?: string
          earned_date?: string | null
          progress?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          type: string
          description: string | null
          date: string
          icon: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          description?: string | null
          date?: string
          icon?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          description?: string | null
          date?: string
          icon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          description?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_ingredients: {
  Row: {
    id: string
    recipe_id: string
    name: string
    quantity: string
    category: string
    price: number
    created_at: string
  }
  Insert: {
    id?: string
    recipe_id: string
    name: string
    quantity: string
    category: string
    price?: number
    created_at?: string
  }
  Update: {
    id?: string
    recipe_id?: string
    name?: string
    quantity?: string
    category?: string
    price?: number
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "recipe_ingredients_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    }
  ]
}
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty: "easy" | "medium" | "hard"
      category: "breakfast" | "lunch" | "dinner"
      day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      units: "imperial" | "metric"
      week_starts_on: "sunday" | "monday"
      theme: "light" | "dark" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals["public"]

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
      difficulty: ["easy", "medium", "hard"] as const,
      category: ["breakfast", "lunch", "dinner"] as const,
      day_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const,
      meal_type: ["breakfast", "lunch", "dinner", "snack"] as const,
      units: ["imperial", "metric"] as const,
      week_starts_on: ["sunday", "monday"] as const,
      theme: ["light", "dark", "system"] as const,
    },
  },
} as const

