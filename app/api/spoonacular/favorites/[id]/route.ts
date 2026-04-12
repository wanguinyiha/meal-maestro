import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { fetchSpoonacularRecipeInformation } from "@/lib/spoonacular"

const EXTERNAL_SOURCE = "spoonacular"

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const raw = await fetchSpoonacularRecipeInformation(id)

    const title = String(raw?.title || "Untitled")
    const imageUrl = raw?.image ? String(raw.image) : null

    const { data: snapshot, error: snapshotError } = await supabase
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
      .select("id, external_id, external_source, title, image_url, last_fetched_at")
      .single()

    if (snapshotError || !snapshot) throw snapshotError

    const { error: favError } = await supabase
      .from("user_external_favorites")
      .upsert(
        {
          user_id: user.id,
          external_recipe_id: snapshot.id,
        },
        { onConflict: "user_id,external_recipe_id" }
      )

    if (favError) throw favError

    return NextResponse.json({ ok: true, snapshot })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to favorite recipe" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params

    const { data: snapshot, error: snapshotError } = await supabase
      .from("external_recipes")
      .select("id")
      .eq("external_source", EXTERNAL_SOURCE)
      .eq("external_id", String(id))
      .maybeSingle()

    if (snapshotError) throw snapshotError
    if (!snapshot) return NextResponse.json({ ok: true })

    const { error: deleteError } = await supabase
      .from("user_external_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("external_recipe_id", snapshot.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to unfavorite recipe" }, { status: 500 })
  }
}

