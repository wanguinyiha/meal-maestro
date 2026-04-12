"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, DollarSign, Heart, ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/supabase"

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  ingredients: Database['public']['Tables']['recipe_ingredients']['Row'][]
  instructions: Database['public']['Tables']['recipe_instructions']['Row'][]
}

interface ViewRecipeProps {
  recipe: Recipe
  onBack?: () => void
}

export default function ViewRecipe({ recipe, onBack }: ViewRecipeProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.id)
        .maybeSingle()
      if (error) {
        toast.error("Failed to check favorite")
      } else {
        setIsFavorite(!!data)
      }
    }
    checkFavorite()
  }, [supabase, recipe.id])

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please log in to favorite recipes")
      return
    }
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.id)
        if (error) throw error
        setIsFavorite(false)
        toast.success("Removed from favorites")
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: user.id, recipe_id: recipe.id })
        if (error) throw error
        setIsFavorite(true)
        toast.success("Added to favorites")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update favorite")
    }
  }

  const addToPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please log in to add to meal plan")
      return
    }
    try {
      // Fetch current meal plan ID (e.g., latest week)
      const { data: planData } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("week_start_date", { ascending: false })
        .limit(1)
      const planId = planData?.[0]?.id || "default-plan-id" // Fallback

      const { error } = await supabase
        .from("planned_meals")
        .insert({
          plan_id: planId,
          recipe_id: recipe.id,
          day_of_week: "monday", // Default or user selection
          meal_type: recipe.category as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          servings: recipe.servings,
        })
      if (error) throw error
      toast.success("Recipe added to meal plan!")
    } catch (err: any) {
      toast.error(err.message || "Failed to add to meal plan")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recipes
        </Button>
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={recipe.image_url || "/placeholder.svg"}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={toggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </Button>
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              {recipe.category}
            </Badge>
          </div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
              <Badge variant="outline" className="ml-2 shrink-0">
                {recipe.difficulty}
              </Badge>
            </div>
            <CardDescription className="text-base">{recipe.description || "No description available"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{recipe.prep_time_min}m</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>KES {recipe.cost.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Nutrition (per serving)</h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{recipe.calories}</div>
                  <div className="text-muted-foreground">cal</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{recipe.protein_g}g</div>
                  <div className="text-muted-foreground">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{recipe.carbs_g}g</div>
                  <div className="text-muted-foreground">carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{recipe.fat_g}g</div>
                  <div className="text-muted-foreground">fat</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    {ingredient.quantity} {ingredient.name} ({ingredient.category})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              {recipe.instructions.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  {recipe.instructions.map((step) => (
                    <li key={step.id}>{step.description}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No instructions available.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={addToPlan}>
                <Plus className="h-4 w-4 mr-1" />
                Add to Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
