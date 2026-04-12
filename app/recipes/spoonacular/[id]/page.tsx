"use client"

import { useParams } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import ViewSpoonacularRecipe from "@/components/recipes/ViewSpoonacularRecipe"

export default function SpoonacularRecipePage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined)

  if (!id) return null

  return (
    <DashboardLayout>
      <ViewSpoonacularRecipe externalId={id} />
    </DashboardLayout>
  )
}

