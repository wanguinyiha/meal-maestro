"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ViewRecipe from "@/components/ViewRecipe"
import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/supabase"
import { useAuth } from "@/app/AuthProvider"
import DashboardLayout from "@/components/DashboardLayout";

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  ingredients: Database['public']['Tables']['recipe_ingredients']['Row'][]
  instructions: Database['public']['Tables']['recipe_instructions']['Row'][]
}

export default function RecipePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!params.id || !user) return

      try {
        const supabase = createClient()

        // Fetch recipe with ingredients and instructions
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select(`
            *,
            ingredients:recipe_ingredients(*),
            instructions:recipe_instructions(*)
          `)
          .eq("id", Array.isArray(params.id) ? params.id[0] : params.id)
          .maybeSingle()

        if (recipeError) throw recipeError
        if (!recipeData) {
          setError("Recipe not found")
          return
        }

        setRecipe(recipeData)
      } catch (err: any) {
        setError(err.message || "Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params.id, user])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading recipe...</div>
  }

  if (error || !recipe) {
    return <div className="flex items-center justify-center min-h-screen text-destructive">
      {error || "Recipe not found"}
    </div>
  }

  return <DashboardLayout><ViewRecipe recipe={recipe} onBack={() => router.push('/recipes')} /></DashboardLayout>
}
