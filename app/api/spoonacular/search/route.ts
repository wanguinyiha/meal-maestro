import { NextResponse, type NextRequest } from "next/server"
import { assertSpoonacularKey } from "@/lib/spoonacular"

export async function GET(request: NextRequest) {
  try {
    const apiKey = assertSpoonacularKey()
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get("q") || "").trim()
    const number = Math.min(Math.max(Number(searchParams.get("number") || 12), 1), 24)

    const url = new URL("https://api.spoonacular.com/recipes/complexSearch")
    url.searchParams.set("apiKey", apiKey)
    url.searchParams.set("number", String(number))
    url.searchParams.set("addRecipeInformation", "true")
    url.searchParams.set("fillIngredients", "true")
    if (query) url.searchParams.set("query", query)

    const response = await fetch(url.toString(), { cache: "no-store" })
    if (!response.ok) {
      const text = await response.text().catch(() => "")
      return NextResponse.json(
        { error: `Spoonacular error (${response.status}): ${text || response.statusText}` },
        { status: 500 }
      )
    }

    const json = await response.json()
    return NextResponse.json(json)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to search Spoonacular" }, { status: 500 })
  }
}

