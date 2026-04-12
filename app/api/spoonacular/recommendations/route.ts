import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { assertSpoonacularKey } from "@/lib/spoonacular"

function normalizeList(values: (string | null | undefined)[]) {
  return values.map((v) => String(v || "").trim()).filter(Boolean)
}

// Map common app values to Spoonacular diet params
function mapDiet(value: string) {
  const v = value.toLowerCase()
  if (v === "none" || v === "no specific preference") return ""
  if (v.includes("vegetarian")) return "vegetarian"
  if (v.includes("vegan")) return "vegan"
  if (v.includes("gluten")) return "gluten free"
  if (v.includes("ket")) return "ketogenic"
  if (v.includes("paleo")) return "paleo"
  return value
}

export async function GET() {
  try {
    const apiKey = assertSpoonacularKey()
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dietFromMetadata = mapDiet(String((user as any)?.user_metadata?.dietary_preference || ""))

    const { data: allergenRows } = await supabase
      .from("user_allergens")
      .select("allergens:allergen_id(name)")
      .eq("user_id", user.id)

    const intolerances = normalizeList(
      (allergenRows ?? []).map((r: any) => r?.allergens?.name).filter(Boolean)
    )

    const { data: restrictionRows } = await supabase
      .from("user_dietary_restrictions")
      .select("dietary_restrictions:restriction_id(name)")
      .eq("user_id", user.id)

    const restrictions = normalizeList(
      (restrictionRows ?? []).map((r: any) => r?.dietary_restrictions?.name).filter(Boolean)
    )

    const { data: goals } = await supabase
      .from("dietary_preferences")
      .select("daily_calories, protein_goal_g, carb_goal_g, fat_goal_g")
      .eq("user_id", user.id)
      .maybeSingle()

    const url = new URL("https://api.spoonacular.com/recipes/complexSearch")
    url.searchParams.set("apiKey", apiKey)
    url.searchParams.set("number", "12")
    url.searchParams.set("addRecipeInformation", "true")
    url.searchParams.set("fillIngredients", "true")
    url.searchParams.set("sort", "random")

    const diet = dietFromMetadata || (restrictions[0] ? mapDiet(restrictions[0]) : "")
    if (diet) url.searchParams.set("diet", diet)
    if (intolerances.length) url.searchParams.set("intolerances", intolerances.join(","))

    const dailyCalories = Number(goals?.daily_calories)
    if (Number.isFinite(dailyCalories) && dailyCalories > 0) {
      const perMeal = Math.round(dailyCalories / 3)
      url.searchParams.set("maxCalories", String(perMeal + 250))
      url.searchParams.set("minCalories", String(Math.max(0, perMeal - 350)))
    }

    const response = await fetch(url.toString(), { cache: "no-store" })
    if (!response.ok) {
      const text = await response.text().catch(() => "")
      return NextResponse.json(
        { error: `Spoonacular error (${response.status}): ${text || response.statusText}` },
        { status: 500 }
      )
    }

    const json = await response.json()
    return NextResponse.json({
      results: json?.results ?? [],
      applied: {
        diet,
        intolerances,
        restrictions,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch recommendations" }, { status: 500 })
  }
}

