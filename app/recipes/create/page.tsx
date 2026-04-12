"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import RecipeForm, { type RecipeFormValues } from "@/components/recipes/RecipeForm";

export default function CreateRecipePage() {
  const router = useRouter();

  const handleCreate = async (values: RecipeFormValues) => {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          image_url: values.image_url.trim() ? values.image_url.trim() : null,
          prep_time_min: values.prep_time_min,
          servings: values.servings,
          cost: values.cost,
          calories: values.calories,
          protein_g: values.protein_g,
          carbs_g: values.carbs_g,
          fat_g: values.fat_g,
          difficulty: values.difficulty,
          category: values.category,
          tags: values.tags,
          instructions: values.instructions,
          ingredients: values.ingredients,
        }),
      });

      if (!response.ok) throw new Error("Failed to create recipe");
      const recipe = await response.json();

      toast.success("Recipe created successfully!");
      router.push(`/recipes/${recipe.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create recipe");
    }
  };

  return (
    <DashboardLayout>
      <RecipeForm
        title="Create recipe"
        description="Add a new recipe to your library with ingredients, steps, and nutrition."
        submitLabel="Create recipe"
        onSubmit={handleCreate}
      />
    </DashboardLayout>
  );
}
