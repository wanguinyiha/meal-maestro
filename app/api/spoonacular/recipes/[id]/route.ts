import { NextResponse, type NextRequest } from "next/server"
import { fetchSpoonacularRecipeInformation } from "@/lib/spoonacular"

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const recipe = await fetchSpoonacularRecipeInformation(id)
    return NextResponse.json(recipe)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch Spoonacular recipe" }, { status: 500 })
  }
}

