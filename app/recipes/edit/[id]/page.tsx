"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import RecipeForm, { type RecipeFormValues } from "@/components/recipes/RecipeForm";

export default function EditRecipePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);
  const [initialValues, setInitialValues] = useState<RecipeFormValues | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) throw new Error("Failed to fetch recipe");
        const data = await response.json();
        setInitialValues({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          prep_time_min: data.prep_time_min || 0,
          servings: data.servings || 1,
          cost: data.cost || 0,
          calories: data.calories || 0,
          protein_g: data.protein_g || 0,
          carbs_g: data.carbs_g || 0,
          fat_g: data.fat_g || 0,
          difficulty: data.difficulty || "easy",
          category: data.category || "lunch",
          tags: data.tags || [],
          instructions: data.instructions?.map((i: any) => i.description) || [""],
          ingredients: data.ingredients || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load recipe");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchRecipe();
  }, [id]);

  const handleUpdate = async (values: RecipeFormValues) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
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

      if (!response.ok) throw new Error("Failed to update recipe");

      toast.success("Recipe updated successfully!");
      router.push(`/recipes/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update recipe");
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <RecipeForm
        title="Edit recipe"
        description="Update your recipe details, ingredients, steps, and nutrition."
        submitLabel="Save changes"
        initialValues={initialValues ?? undefined}
        onSubmit={handleUpdate}
      />
    </DashboardLayout>
  );
}
