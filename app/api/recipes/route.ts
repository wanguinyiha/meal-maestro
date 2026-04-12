import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      image_url,
      prep_time_min,
      servings,
      cost,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      difficulty,
      category,
      tags,
      instructions,
      ingredients,
    } = body;

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title,
        description,
        image_url,
        prep_time_min,
        servings,
        cost,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        difficulty,
        category,
        tags,
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert instructions
    if (instructions?.length) {
      const instructionInserts = instructions.map((desc: string, index: number) => ({
        recipe_id: recipe.id,
        step_number: index + 1,
        description: desc,
      }));

      const { error: instrError } = await supabase
        .from("recipe_instructions")
        .insert(instructionInserts);

      if (instrError) throw instrError;
    }

    // Insert ingredients
    if (ingredients?.length) {
      const ingredientInserts = ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        category: ing.category,
        price: ing.price,
      }));

      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientInserts);

      if (ingError) throw ingError;
    }

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
