"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Clock, Users, DollarSign, Heart, Plus, Search, Pencil } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/supabase"
import { useAuth } from '@/app/AuthProvider';
import DashboardLayout from "@/components/DashboardLayout";
import { updateAchievementProgress, updateStreak} from "@/utils/achievements"; //logActivity


type Recipe = Database['public']['Tables']['recipes']['Row']

type ExternalRecipeSnapshot = {
  id: string
  external_id: string
  title: string
  image_url: string | null
  raw_json?: any
  last_fetched_at: string
}

type SpoonacularSearchResult = {
  id: number
  title: string
  image?: string
  readyInMinutes?: number
  servings?: number
  summary?: string
}

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [activeTab, setActiveTab] = useState("my")
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [externalFavorites, setExternalFavorites] = useState<ExternalRecipeSnapshot[]>([])
  const [externalFavoritesLoaded, setExternalFavoritesLoaded] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [onlineRecipes, setOnlineRecipes] = useState<SpoonacularSearchResult[]>([])
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [onlineRecommended, setOnlineRecommended] = useState<SpoonacularSearchResult[]>([])
  const [onlineRecommendedLoading, setOnlineRecommendedLoading] = useState(false)
  const [onlineRecommendationsNonce, setOnlineRecommendationsNonce] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user || authLoading) return;
    async function fetchRecipes() {
      setLoading(true)
      let finishLoading = true
      try {
        console.log("Fetching recipes from Supabase...");

        if (activeTab === "online") {
          setRecipes([])
          return
        }

        if (activeTab === "favorites") {
          if (!favoritesLoaded) {
            finishLoading = false
            return
          }
          if (favorites.length === 0) {
            setRecipes([])
            return
          }
          const { data, error, status, statusText } = await supabase
            .from("recipes")
            .select(
              "id, title, description, image_url, prep_time_min, servings, cost, calories, protein_g, carbs_g, fat_g, difficulty, category, tags, user_id"
            )
            .in("id", favorites)

          if (error) {
            console.error("Supabase query error:", { error, status, statusText })
            toast.error(`Failed to fetch recipes: ${error.message} (Status: ${status})`)
            return
          }

          setRecipes(data?.map((item: any) => ({ ...item, created_at: new Date().toISOString() })) || [])
          return
        }

        let query = supabase
          .from("recipes")
          .select("id, title, description, image_url, prep_time_min, servings, cost, calories, protein_g, carbs_g, fat_g, difficulty, category, tags, user_id")

        if (activeTab === "my") query = query.eq("user_id", user!.id);

        const { data, error, status, statusText } = await query;
        if (error) {
          console.error("Supabase query error:", { error, status, statusText });
          toast.error(`Failed to fetch recipes: ${error.message} (Status: ${status})`);
          return;
        }
        console.log("Recipes fetched:", data, "Count:", data?.length);
        setRecipes(data?.map((item: any) => ({ ...item, created_at: new Date().toISOString() })) || []);
      } catch (err: any) {
        console.error("Unexpected error:", err);
        toast.error(err.message || "Unexpected error fetching recipes");
      } finally {
        if (finishLoading) setLoading(false);
      }
    }
    fetchRecipes();
  }, [supabase, activeTab, user, authLoading, favorites, favoritesLoaded]);

  useEffect(() => {
    if (!user) return;
    async function fetchFavorites() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("recipe_id")
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching favorites:", error);
          toast.error("Failed to fetch favorites");
          return
        }
        console.log("Favorites fetched:", data);
        setFavorites(data.map((fav) => fav.recipe_id));
      } finally {
        setFavoritesLoaded(true)
      }
    }
    fetchFavorites();
  }, [user, supabase]);

  useEffect(() => {
    const userId = user?.id
    if (!userId) return
    async function fetchExternalFavorites(safeUserId: string) {
      try {
        const { data, error } = await supabase
          .from("user_external_favorites")
          .select(
            `
            external_recipe_id,
            external_recipes:external_recipe_id (
              id,
              external_id,
              title,
              image_url,
              raw_json,
              last_fetched_at
            )
          `
          )
          .eq("user_id", safeUserId)

        if (error) {
          console.error("Error fetching external favorites:", error)
          toast.error("Failed to fetch external favorites")
          return
        }

        const snapshots = (data ?? [])
          .map((row: any) => row.external_recipes)
          .filter(Boolean) as ExternalRecipeSnapshot[]

        setExternalFavorites(snapshots)
      } finally {
        setExternalFavoritesLoaded(true)
      }
    }
    fetchExternalFavorites(userId)
  }, [supabase, user])

  const toggleExternalFavorite = async (externalRecipeId: string, currentlyFavorited: boolean) => {
    try {
      const res = await fetch(`/api/spoonacular/favorites/${encodeURIComponent(externalRecipeId)}`, {
        method: currentlyFavorited ? "DELETE" : "POST",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to update favorite")

      if (currentlyFavorited) {
        setExternalFavorites((prev) => prev.filter((r) => r.external_id !== externalRecipeId))
      } else if (json?.snapshot) {
        setExternalFavorites((prev) => {
          const exists = prev.some((r) => r.external_id === String(json.snapshot.external_id))
          if (exists) return prev
          return [
            ...prev,
            {
              id: String(json.snapshot.id),
              external_id: String(json.snapshot.external_id),
              title: String(json.snapshot.title || "Untitled"),
              image_url: json.snapshot.image_url ? String(json.snapshot.image_url) : null,
              last_fetched_at: String(json.snapshot.last_fetched_at || new Date().toISOString()),
              raw_json: json.snapshot.raw_json ?? null,
            },
          ]
        })
      }
      toast.success("Updated favorites")
    } catch (err: any) {
      console.error("Error toggling external favorite:", err)
      toast.error(err.message || "Failed to update favorite")
    }
  }

  const filteredExternalFavorites = externalFavorites.filter((r) => {
    if (!searchTerm.trim()) return true
    const text = `${r.title ?? ""}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  const externalFavoriteIds = useMemo(() => new Set(externalFavorites.map((r) => String(r.external_id))), [externalFavorites])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      if (!user || authLoading) return
      if (activeTab !== "online") return

      const query = searchTerm.trim()
      if (!query) {
        setOnlineRecipes([])
        return
      }

      setOnlineLoading(true)
      try {
        const res = await fetch(`/api/spoonacular/search?q=${encodeURIComponent(query)}&number=12`, {
          signal: controller.signal,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || "Failed to fetch online recipes")
        const results = (json?.results ?? []) as SpoonacularSearchResult[]
        if (!cancelled) setOnlineRecipes(results)
      } catch (e: any) {
        if (e?.name === "AbortError") return
        toast.error(e?.message || "Failed to fetch online recipes")
      } finally {
        if (!cancelled) setOnlineLoading(false)
      }
    }

    const t = setTimeout(run, 350)
    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(t)
    }
  }, [activeTab, authLoading, searchTerm, user, onlineRecommendationsNonce])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      if (!user || authLoading) return
      if (activeTab !== "online") return
      if (searchTerm.trim()) return

      setOnlineRecommendedLoading(true)
      try {
        const res = await fetch(`/api/spoonacular/recommendations`, { signal: controller.signal })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || "Failed to load recommendations")
        const results = (json?.results ?? []) as SpoonacularSearchResult[]
        if (!cancelled) setOnlineRecommended(results)
      } catch (e: any) {
        if (e?.name === "AbortError") return
        toast.error(e?.message || "Failed to load recommendations")
      } finally {
        if (!cancelled) setOnlineRecommendedLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [activeTab, authLoading, searchTerm, user])

  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      toast.error("Please log in to favorite recipes")
      return
    }
    try {
      if (favorites.includes(recipeId)) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId)
        if (error) throw error
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
        toast.success("Removed from favorites")
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: user.id, recipe_id: recipeId })
        if (error) throw error
        setFavorites((prev) => [...prev, recipeId])
        toast.success("Added to favorites")

        // Update achievement progress
        await updateAchievementProgress(user.id, 'recipe-collector', 1)
        // await logActivity(user.id, 'favorite_added', `Added "${recipes.find(r => r.id === recipeId)?.title}" to favorites`, 'Star')
        await updateStreak(user.id)
      }
    } catch (err: any) {
      console.error("Error toggling favorite:", err)
      toast.error(err.message || "Failed to update favorite")
    }
  }

  const addToPlan = async (recipeId: string, category: string) => {
    if (!user) {
      toast.error("Please log in to add to meal plan");
      return;
    }
    try {
      let { data: planData } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("week_start_date", { ascending: false })
        .limit(1);

      let planId = planData?.[0]?.id;

      if (!planId) {
        // Create a new meal plan for the current week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const { data: newPlan, error: planError } = await supabase
          .from("meal_plans")
          .insert({ user_id: user.id, week_start_date: weekStart.toISOString().split('T')[0] })
          .select("id")
          .single();
        if (planError) throw planError;
        planId = newPlan.id;
      }

      console.log("Adding to plan with ID:", planId);

      const { error } = await supabase
        .from("planned_meals")
        .insert({
          plan_id: planId,
          recipe_id: recipeId,
          day_of_week: "monday",
          meal_type: category as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          servings: 1,
        });
      if (error) throw error;
      toast.success("Recipe added to meal plan!");

      // Update achievement progress
      await updateAchievementProgress(user.id, 'meal-planner-beginner', 1)
      // await logActivity(user.id, 'meal_planned', `Added "${recipes.find(r => r.id === recipeId)?.title}" to meal plan`, 'Calendar')
      await updateStreak(user.id)
    } catch (err: any) {
      console.error("Error adding to plan:", err);
      toast.error(err.message || "Failed to add to meal plan");
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || recipe.category.toLowerCase() === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty.toLowerCase() === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) return null;
  if (authLoading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-screen">Loading...</div></DashboardLayout>;
  }


  return (
    <DashboardLayout>
      <div className="bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Recipe Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover delicious, budget-friendly recipes perfect for meal prep. Filter by dietary needs, prep time, and more.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search recipes, ingredients, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my">My Recipes</TabsTrigger>
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="online">Online Recipes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={recipe.image_url || "/placeholder.svg"} alt={recipe.title} className="w-full h-48 object-cover" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(recipe.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                      />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{recipe.category}</Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{recipe.description || "No description available"}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
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
                        <span>KES {Number(recipe.cost).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs">
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

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm" onClick={() => addToPlan(recipe.id, recipe.category)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Plan
                      </Button>
                      {user?.id === recipe.user_id ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/recipes/edit/${recipe.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/recipes/${recipe.id}`)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find more recipes.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="my" className="mt-6">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={recipe.image_url || "/placeholder.svg"} alt={recipe.title} className="w-full h-48 object-cover" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(recipe.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                      />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{recipe.category}</Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{recipe.description || "No description available"}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
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
                        <span>KES {Number(recipe.cost).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs">
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

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm" onClick={() => addToPlan(recipe.id, recipe.category)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Plan
                      </Button>
                      {user?.id === recipe.user_id ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/recipes/edit/${recipe.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/recipes/${recipe.id}`)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find more recipes.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="online" className="mt-6">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Search Spoonacular using the search box above. Favoriting saves a snapshot to your account.
              </p>
            </div>

            {!searchTerm.trim() ? onlineRecommendedLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading recommendations...</div>
            ) : onlineRecommended.length ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Recommended for you</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOnlineRecommended([])
                      setOnlineRecommendationsNonce((n) => n + 1)
                    }}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {onlineRecommended.map((r) => {
                    const isFav = externalFavoriteIds.has(String(r.id))
                    return (
                      <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img src={r.image || "/placeholder.svg"} alt={r.title} className="w-full h-48 object-cover" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                            onClick={() => toggleExternalFavorite(String(r.id), isFav)}
                          >
                            <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                          </Button>
                          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">online</Badge>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg leading-tight">{r.title}</CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{r.readyInMinutes ?? 0}m</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{r.servings ?? 0} servings</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/recipes/spoonacular/${r.id}`)}
                            >
                              View Recipe
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Search online recipes</h3>
                <p className="text-muted-foreground mb-4">Try “chicken”, “pasta”, or “vegetarian”.</p>
              </div>
            ) : onlineLoading ? (
              <div className="text-center py-12 text-muted-foreground">Searching...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {onlineRecipes.map((r) => {
                  const isFav = externalFavoriteIds.has(String(r.id))
                  return (
                    <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={r.image || "/placeholder.svg"} alt={r.title} className="w-full h-48 object-cover" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => toggleExternalFavorite(String(r.id), isFav)}
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                        </Button>
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">online</Badge>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg leading-tight">{r.title}</CardTitle>
                        {r.summary ? (
                          <CardDescription className="text-sm leading-relaxed line-clamp-2">
                            {String(r.summary).replace(/<[^>]+>/g, "")}
                          </CardDescription>
                        ) : null}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{r.readyInMinutes ?? 0}m</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{r.servings ?? 0} servings</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/recipes/spoonacular/${r.id}`)}
                          >
                            View Recipe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={recipe.image_url || "/placeholder.svg"} alt={recipe.title} className="w-full h-48 object-cover" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{recipe.category}</Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{recipe.description || "No description available"}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
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
                        <span>KES {Number(recipe.cost).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs">
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

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm" onClick={() => addToPlan(recipe.id, recipe.category)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Plan
                      </Button>
                      {user?.id === recipe.user_id ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/recipes/edit/${recipe.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/recipes/${recipe.id}`)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && filteredExternalFavorites.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Favorite recipes to find them quickly here.
                </p>
                <Button onClick={() => setActiveTab("all")}>
                  Browse recipes
                </Button>
              </div>
            )}

            {(externalFavoritesLoaded && filteredExternalFavorites.length > 0) && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-foreground mb-4">Spoonacular favorites</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExternalFavorites.map((snap) => (
                    <Card key={snap.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={snap.image_url || "/placeholder.svg"} alt={snap.title} className="w-full h-48 object-cover" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => toggleExternalFavorite(snap.external_id, true)}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">spoonacular</Badge>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg leading-tight">{snap.title}</CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/recipes/spoonacular/${snap.external_id}`)}
                          >
                            View Recipe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </DashboardLayout>
  );
}
