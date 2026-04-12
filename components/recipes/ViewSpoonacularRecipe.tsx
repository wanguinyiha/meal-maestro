"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Heart, ListOrdered, Plus, Users } from "lucide-react"
import { useAuth } from "@/app/AuthProvider"
import { createClient } from "@/utils/supabase/client"

const EXTERNAL_SOURCE = "spoonacular"

type SnapshotRow = {
  id: string
  external_source: string
  external_id: string
  title: string
  image_url: string | null
  raw_json: any
  last_fetched_at: string
}

export default function ViewSpoonacularRecipe({ externalId }: { externalId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [snapshot, setSnapshot] = useState<SnapshotRow | null>(null)
  const [liveRecipe, setLiveRecipe] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const recipe = snapshot?.raw_json ?? liveRecipe

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("external_recipes")
          .select("id, external_source, external_id, title, image_url, raw_json, last_fetched_at")
          .eq("external_source", EXTERNAL_SOURCE)
          .eq("external_id", String(externalId))
          .maybeSingle()

        if (error) throw error
        if (!cancelled) setSnapshot((data as any) ?? null)

        if (data?.id) {
          const { data: fav, error: favErr } = await supabase
            .from("user_external_favorites")
            .select("external_recipe_id")
            .eq("user_id", user.id)
            .eq("external_recipe_id", data.id)
            .maybeSingle()
          if (favErr) throw favErr
          if (!cancelled) setIsFavorite(!!fav)
        } else {
          const res = await fetch(`/api/spoonacular/recipes/${encodeURIComponent(externalId)}`)
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(json?.error || "Failed to fetch recipe")
          if (!cancelled) setLiveRecipe(json)
        }
      } catch (e: any) {
        toast.error(e?.message || "Failed to load recipe")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [externalId, supabase, user])

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`/api/spoonacular/favorites/${encodeURIComponent(externalId)}`, {
        method: isFavorite ? "DELETE" : "POST",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to update favorite")
      if (!isFavorite && json?.snapshot) {
        setSnapshot(json.snapshot)
        setLiveRecipe(null)
      }
      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
    } catch (e: any) {
      toast.error(e?.message || "Failed to update favorite")
    }
  }

  const addToPlanAndEdit = async () => {
    try {
      setIsImporting(true)
      const res = await fetch(`/api/spoonacular/import/${encodeURIComponent(externalId)}?addToPlan=1`, {
        method: "POST",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to add to plan")
      toast.success("Added to plan. Customize servings & ingredient prices next.")
      router.push(`/recipes/edit/${json.recipe_id}`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to add to plan")
    } finally {
      setIsImporting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading recipe...</div>
  }

  if (!recipe) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Recipe not available</CardTitle>
            <CardDescription>
              We couldn't load this online recipe right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push("/recipes")}>Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ingredients: { name: string; original?: string; amount?: number; unit?: string }[] =
    recipe?.extendedIngredients ?? []
  const instructionSteps: { number?: number; step: string }[] =
    recipe?.analyzedInstructions?.[0]?.steps ?? recipe?.instructions ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Button variant="ghost" onClick={() => router.push("/recipes")}>
            Back to Recipes
          </Button>
          <Button variant={isFavorite ? "secondary" : "default"} onClick={toggleFavorite}>
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={(snapshot?.image_url || recipe?.image) ?? "/placeholder.svg"}
              alt={String(snapshot?.title || recipe?.title || "Recipe")}
              className="w-full h-64 object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">spoonacular</Badge>
          </div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-2xl font-bold">{String(snapshot?.title || recipe?.title || "Recipe")}</CardTitle>
            </div>
            <CardDescription className="text-base">{recipe?.summary ? String(recipe.summary).replace(/<[^>]+>/g, "") : ""}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{recipe?.readyInMinutes ?? 0}m</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{recipe?.servings ?? 0} servings</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>Imported snapshot</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {ingredients.map((ing, idx) => (
                  <li key={idx}>{ing.original || ing.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              {instructionSteps?.length ? (
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  {instructionSteps.map((s: any, idx: number) => (
                    <li key={idx}>{String(s.step ?? s).trim()}</li>
                  ))}
                </ol>
              ) : (
                <div className="text-sm text-muted-foreground">No instructions available.</div>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={addToPlanAndEdit} disabled={isImporting}>
                <ListOrdered className="h-4 w-4 mr-1" />
                {isImporting ? "Adding..." : "Add to Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
