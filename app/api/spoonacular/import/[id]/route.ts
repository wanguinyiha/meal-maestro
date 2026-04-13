import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { fetchSpoonacularRecipeInformation } from "@/lib/spoonacular"

const EXTERNAL_SOURCE = "spoonacular"

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

function nutrientValue(raw: any, name: string) {
  const nutrients = raw?.nutrition?.nutrients
  if (!Array.isArray(nutrients)) return 0
  const hit = nutrients.find((n: any) => String(n?.name).toLowerCase() === name.toLowerCase())
  const amount = Number(hit?.amount)
  return Number.isFinite(amount) ? amount : 0
}

function difficultyFromMinutes(minutes: number): "easy" | "medium" | "hard" {
  if (minutes <= 20) return "easy"
  if (minutes <= 45) return "medium"
  return "hard"
}

function categoryFromDishTypes(raw: any): "breakfast" | "lunch" | "dinner" {
  const dishTypes: string[] = Array.isArray(raw?.dishTypes) ? raw.dishTypes.map((s: any) => String(s).toLowerCase()) : []
  if (dishTypes.some((d) => d.includes("breakfast"))) return "breakfast"
  if (dishTypes.some((d) => d.includes("dinner"))) return "dinner"
  return "lunch"
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const addToPlan = searchParams.get("addToPlan") === "1"

    const { data: existing, error: existingError } = await supabase
      .from("external_recipe_imports")
      .select("recipe_id")
      .eq("user_id", user.id)
      .eq("external_source", EXTERNAL_SOURCE)
      .eq("external_id", String(id))
      .maybeSingle()

    if (existingError) throw existingError
    if (existing?.recipe_id) {
      return NextResponse.json({ recipe_id: existing.recipe_id, imported: false, added_to_plan: false })
    }

    const raw = await fetchSpoonacularRecipeInformation(id)

    const title = String(raw?.title || "Untitled")
    const description = raw?.summary ? stripHtml(String(raw.summary)) : ""
    const imageUrl = raw?.image ? String(raw.image) : null
    const prep = Number(raw?.readyInMinutes)
    const prep_time_min = Number.isFinite(prep) ? prep : 0
    const servingsRaw = Number(raw?.servings)
    const servings = Number.isFinite(servingsRaw) && servingsRaw > 0 ? servingsRaw : 1

    const calories = Math.round(nutrientValue(raw, "Calories"))
    const protein_g = Math.round(nutrientValue(raw, "Protein"))
    const carbs_g = Math.round(nutrientValue(raw, "Carbohydrates"))
    const fat_g = Math.round(nutrientValue(raw, "Fat"))

    const difficulty = difficultyFromMinutes(prep_time_min)
    const category = categoryFromDishTypes(raw)

    const tags = [
      ...(Array.isArray(raw?.cuisines) ? raw.cuisines : []),
      ...(Array.isArray(raw?.diets) ? raw.diets : []),
      ...(Array.isArray(raw?.dishTypes) ? raw.dishTypes : []),
    ]
      .map((t: any) => String(t).trim())
      .filter(Boolean)
      .slice(0, 12)

    // Upsert snapshot (so the recipe can be viewed later even if API changes)
    const { error: snapshotError } = await supabase
      .from("external_recipes")
      .upsert(
        {
          external_source: EXTERNAL_SOURCE,
          external_id: String(id),
          title,
          image_url: imageUrl,
          raw_json: raw,
          last_fetched_at: new Date().toISOString(),
        },
        { onConflict: "external_source,external_id" }
      )

    if (snapshotError) throw snapshotError

    // Create internal recipe (editable)
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        image_url: imageUrl,
        prep_time_min,
        servings,
        cost: 0,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        difficulty,
        category,
        tags,
      })
      .select("id, category, servings")
      .single()

    if (recipeError || !recipe) throw recipeError

    const extendedIngredients: any[] = Array.isArray(raw?.extendedIngredients) ? raw.extendedIngredients : []
    const ingredientInserts = extendedIngredients
      .map((ing: any) => ({
        recipe_id: recipe.id,
        name: String(ing?.name || "").trim(),
        quantity: String(ing?.original || ing?.originalString || "").trim(),
        category: String(ing?.aisle || "").trim(),
        price: 0,
      }))
      .filter((ing) => ing.name || ing.quantity || ing.category)

    if (ingredientInserts.length) {
      const { error: ingError } = await supabase.from("recipe_ingredients").insert(ingredientInserts)
      if (ingError) throw ingError
    }

    const analyzed = Array.isArray(raw?.analyzedInstructions) ? raw.analyzedInstructions : []
    const steps = Array.isArray(analyzed?.[0]?.steps) ? analyzed[0].steps : []
    const instructions = steps
      .map((s: any, idx: number) => ({
        recipe_id: recipe.id,
        step_number: idx + 1,
        description: String(s?.step || "").trim(),
      }))
      .filter((s: any) => s.description)

    if (instructions.length) {
      const { error: instrError } = await supabase.from("recipe_instructions").insert(instructions)
      if (instrError) throw instrError
    }

    const { error: mapError } = await supabase.from("external_recipe_imports").insert({
      user_id: user.id,
      external_source: EXTERNAL_SOURCE,
      external_id: String(id),
      recipe_id: recipe.id,
    })
    if (mapError) throw mapError

    let added_to_plan = false
    if (addToPlan) {
      let { data: planData, error: planError } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("week_start_date", { ascending: false })
        .limit(1)

      if (planError) throw planError

      let planId = planData?.[0]?.id
      if (!planId) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const { data: newPlan, error: newPlanError } = await supabase
          .from("meal_plans")
          .insert({ user_id: user.id, week_start_date: weekStart.toISOString().split("T")[0] })
          .select("id")
          .single()
        if (newPlanError) throw newPlanError
        planId = newPlan.id
      }

      const { error: addError } = await supabase.from("planned_meals").insert({
        plan_id: planId,
        recipe_id: recipe.id,
        day_of_week: "monday",
        meal_type: recipe.category,
        servings: recipe.servings,
      })
      if (addError) throw addError
      added_to_plan = true
    }

    return NextResponse.json({ recipe_id: recipe.id, imported: true, added_to_plan })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to import recipe" }, { status: 500 })
  }
}

