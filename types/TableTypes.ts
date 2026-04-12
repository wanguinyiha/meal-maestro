export type TableTypes = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
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
          difficulty: 'easy' | 'medium' | 'hard'
          category: 'breakfast' | 'lunch' | 'dinner'
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
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
          difficulty: 'easy' | 'medium' | 'hard'
          category: 'breakfast' | 'lunch' | 'dinner'
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
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
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: 'breakfast' | 'lunch' | 'dinner'
          tags?: string[]
          created_at?: string
        }
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
      }
      planned_meals: {
        Row: {
          id: string
          plan_id: string
          recipe_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings: number
        }
        Insert: {
          id?: string
          plan_id: string
          recipe_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings?: number
        }
        Update: {
          id?: string
          plan_id?: string
          recipe_id?: string
          day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings?: number
        }
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
      }
      // Note: grocery_recipe_links and meal_plans tables are not fully defined as they're not directly used
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
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          // Add other fields as needed
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
          user_id?: string
        }
      }
    }
  }
}