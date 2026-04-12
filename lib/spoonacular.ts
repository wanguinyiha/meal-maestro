export type SpoonacularRecipeInformation = Record<string, any>

function getSpoonacularKey() {
  return process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY
}

export function assertSpoonacularKey() {
  const key = getSpoonacularKey()
  if (!key) {
    throw new Error("Missing Spoonacular API key. Set SPOONACULAR_API_KEY (server-only).")
  }
  return key
}

export async function fetchSpoonacularRecipeInformation(id: string) {
  const apiKey = assertSpoonacularKey()
  const url = new URL(`https://api.spoonacular.com/recipes/${encodeURIComponent(id)}/information`)
  url.searchParams.set("includeNutrition", "true")
  url.searchParams.set("apiKey", apiKey)

  const response = await fetch(url.toString(), { cache: "no-store" })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Spoonacular error (${response.status}): ${text || response.statusText}`)
  }
  return (await response.json()) as SpoonacularRecipeInformation
}

