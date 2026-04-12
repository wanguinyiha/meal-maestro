import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Get recipe with ingredients and instructions
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (recipeError) throw recipeError;

    const { data: ingredients, error: ingError } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", id);

    if (ingError) throw ingError;

    const { data: instructions, error: instrError } = await supabase
      .from("recipe_instructions")
      .select("*")
      .eq("recipe_id", id)
      .order("step_number");

    if (instrError) throw instrError;

    return NextResponse.json({
      ...recipe,
      ingredients,
      instructions,
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
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

    // Update recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .update({
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
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Delete existing instructions and ingredients
    await supabase.from("recipe_instructions").delete().eq("recipe_id", id);
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);

    // Insert new instructions
    if (instructions?.length) {
      const instructionInserts = instructions.map((desc: string, index: number) => ({
        recipe_id: id,
        step_number: index + 1,
        description: desc,
      }));

      const { error: instrError } = await supabase
        .from("recipe_instructions")
        .insert(instructionInserts);

      if (instrError) throw instrError;
    }

    // Insert new ingredients
    if (ingredients?.length) {
      const ingredientInserts = ingredients.map((ing: any) => ({
        recipe_id: id,
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

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Delete recipe (cascade will handle related tables if set up)
    const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
