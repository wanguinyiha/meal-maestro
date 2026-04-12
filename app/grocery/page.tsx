"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ChefHat, ShoppingCart, Plus, DollarSign, Check, Trash2, Edit3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/supabase"
import { useAuth } from "@/app/AuthProvider"
import DashboardLayout from "@/components/DashboardLayout"
import { updateAchievementProgress, updateStreak } from "@/utils/achievements" //logActivity
import { GROCERY_CATEGORIES, type GroceryCategory } from "@/lib/grocery-categories"

type GroceryItem = {
  id: string
  name: string
  quantity: string
  price: number
  category: GroceryCategory
  checked: boolean
  recipes: string[]
}

export default function GroceryPage() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>("Other")
  const [newItemQuantity, setNewItemQuantity] = useState("1")
  const [newItemPrice, setNewItemPrice] = useState(0)
  const [budget, setBudget] = useState(100)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (user?.id) {
      fetchGroceryList()
    } else if (status === "unauthenticated") {
      setError("Please log in to view your grocery list")
      setLoading(false)
    }
  }, [user])

  async function fetchGroceryList() {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Fetch user preferences for week_starts_on
      const { data: preferences, error: prefError } = await supabase
        .from("app_preferences")
        .select("week_starts_on")
        .eq("user_id", user.id)
        .single()
      if (prefError && prefError.code !== "PGRST116") throw prefError
      const weekStartPref = preferences?.week_starts_on || "monday"

      // Calculate week start date based on preference
      const today = new Date()
      const dayOfWeek = today.getDay()
      const offset = weekStartPref === "sunday" ? 0 : 1
      const daysSinceWeekStart = (dayOfWeek - offset + 7) % 7
      const weekStart = new Date(today.setDate(today.getDate() - daysSinceWeekStart))
      const weekStartDate = weekStart.toISOString().split("T")[0]

      // Get or create meal plan
      const { data: planData, error: planError } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartDate)
        .maybeSingle()
      if (planError && planError.code !== "PGRST116") throw planError

      let planId = planData?.id
      if (!planData) {
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({ user_id: user.id, week_start_date: weekStartDate })
          .select("id")
          .single()
        if (createError) throw createError
        planId = newPlan.id
      }

      // Fetch planned meals
      const { data: plannedMeals, error: plannedError } = await supabase
        .from("planned_meals")
        .select("recipe_id, servings")
        .eq("plan_id", planId ?? "")
      if (plannedError) throw plannedError

      // Fetch ingredients for planned recipes
      const recipeIds = plannedMeals.map((meal) => meal.recipe_id)
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .select(`
          id,
          recipe_id,
          name,
          quantity,
          category,
          price,
          recipes!recipe_ingredients_recipe_id_fkey (id, title)
        `)
        .in("recipe_id", recipeIds)
      if (ingredientsError) throw ingredientsError

      // Fetch user-specific grocery items
      const { data: groceryItemsData, error: groceryItemsError } = await supabase
        .from("grocery_items")
        .select(`
          id,
          name,
          quantity,
          category,
          price,
          checked,
          plan_id
        `)
        .eq("user_id", user.id)
        .or(`plan_id.eq.${planId},plan_id.is.null`)
      if (groceryItemsError) throw groceryItemsError

      // Fetch grocery_recipe_links for recipe titles
      const { data: linksData, error: linksError } = await supabase
        .from("grocery_recipe_links")
        .select(`
          grocery_id,
          recipe_id,
          recipes (id, title)
        `)
        .in("recipe_id", recipeIds)
      if (linksError) throw linksError

      // Aggregate ingredients and grocery items
      const ingredientMap: Record<string, GroceryItem> = {}
      for (const ingredient of ingredientsData) {
        const key = `${ingredient.name}-${ingredient.category}`
        const recipeTitle = ingredient.recipes?.title || "Unknown Recipe"
        if (!ingredientMap[key]) {
          const recipeTitles = linksData
            .filter((link) => link.grocery_id === ingredient.id)
            .map((link) => link.recipes?.title)
            .filter((title): title is string => !!title)
            .concat(recipeTitle)

          ingredientMap[key] = {
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.quantity || "1",
            price: ingredient.price || 0,
            category: ingredient.category as GroceryItem["category"],
            checked: false,
            recipes: [...new Set(recipeTitles)],
          }
        } else {
          const currentQty = parseFloat(ingredientMap[key].quantity) || 0
          const newQty = parseFloat(ingredient.quantity) || 0
          ingredientMap[key].quantity = `${currentQty + newQty}`
          ingredientMap[key].price += ingredient.price || 0
          ingredientMap[key].recipes = [...new Set([...ingredientMap[key].recipes, recipeTitle])]
        }
      }

      // Merge with user-specific grocery items
      for (const item of groceryItemsData) {
        const key = `${item.name}-${item.category}`
        if (!ingredientMap[key]) {
          const recipeTitles = linksData
            .filter((link) => link.grocery_id === item.id)
            .map((link) => link.recipes?.title)
            .filter((title): title is string => !!title)

          ingredientMap[key] = {
            id: item.id,
            name: item.name,
            quantity: item.quantity || "1",
            price: item.price || 0,
            category: item.category as GroceryItem["category"],
            checked: item.checked,
            recipes: recipeTitles.length > 0 ? recipeTitles : ["Custom item"],
          }
        } else {
          ingredientMap[key].id = item.id
          ingredientMap[key].checked = item.checked
        }
      }

      setGroceryList(Object.values(ingredientMap))
    } catch (err: any) {
      setError(err.message || "Failed to load grocery list")
      toast.error(err.message || "Failed to load grocery list")
      console.error("Error fetching grocery list:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleItemChecked = async (id: string) => {
    try {
      const currentItem = groceryList.find((item) => item.id === id)
      if (!currentItem) return

      const { error } = await supabase
        .from("grocery_items")
        .update({ checked: !currentItem.checked })
        .eq("id", id)
      if (error) throw error

      setGroceryList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to update item")
      console.error("Error toggling item:", err)
    }
  }

  const removeItem = async (id: string) => {
    try {
      const { error: linksError } = await supabase
        .from("grocery_recipe_links")
        .delete()
        .eq("grocery_id", id)
      if (linksError) throw linksError

      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("id", id)
      if (error) throw error

      setGroceryList((prev) => prev.filter((item) => item.id !== id))
      toast.success("Item removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item")
      console.error("Error removing item:", err)
    }
  }

  const addCustomItem = async () => {
    if (!newItem.trim()) {
      toast.error("Please enter an item name")
      return
    }

    try {
      if (!user?.id) {
        toast.error("Please log in to add items")
        return
      }

      const { data: preferences, error: prefError } = await supabase
        .from("app_preferences")
        .select("week_starts_on")
        .eq("user_id", user.id)
        .single()
      if (prefError && prefError.code !== "PGRST116") throw prefError
      const weekStartPref = preferences?.week_starts_on || "monday"

      const today = new Date()
      const dayOfWeek = today.getDay()
      const offset = weekStartPref === "sunday" ? 0 : 1
      const daysSinceWeekStart = (dayOfWeek - offset + 7) % 7
      const weekStart = new Date(today.setDate(today.getDate() - daysSinceWeekStart))
      const weekStartDate = weekStart.toISOString().split("T")[0]

      if(user == null) return null;
      const { data: planData, error: planError } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartDate)
        .maybeSingle()
      if (planError && planError.code !== "PGRST116") throw planError

      let planId = planData?.id
      if (!planData) {
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({ user_id: user.id, week_start_date: weekStartDate })
          .select("id")
          .single()
        if (createError) throw createError
        planId = newPlan.id
      }

      const { data: newItemData, error } = await supabase
        .from("grocery_items")
        .insert({
          user_id: user.id,
          plan_id: null,
          name: newItem,
          quantity: newItemQuantity,
          category: newItemCategory,
          price: newItemPrice,
          checked: false,
        })
        .select("id, name, quantity, category, price, checked")
        .single()
      if (error) throw error

      setGroceryList((prev) => [
        ...prev,
        {
          id: newItemData.id,
          name: newItemData.name,
          quantity: newItemData.quantity || "1",
          price: newItemData.price || 0,
          category: newItemData.category as GroceryItem["category"],
          checked: newItemData.checked,
          recipes: ["Custom item"],
        },
      ])
      setNewItem("")
      setNewItemQuantity("1")
      setNewItemPrice(0)
      toast.success("Item added")

      // Update achievement progress
      await updateAchievementProgress(user.id, 'grocery-guru', 1)
      // await logActivity(user.id, 'grocery_item_added', `Added "${newItemData.name}" to grocery list`, 'ShoppingCart')
      await updateStreak(user.id)
    } catch (err: any) {
      toast.error(err.message || "Failed to add item")
      console.error("Error adding item:", err)
    }
  }

  const markAllCollected = async () => {
    try {
      const planId = groceryList[0]?.id
        ? (await supabase.from("grocery_items").select("plan_id").eq("id", groceryList[0].id).single()).data?.plan_id
        : null
      if (!planId) throw new Error("No meal plan found")

      const { error } = await supabase
        .from("grocery_items")
        .update({ checked: true })
        .eq("plan_id", planId)
      if (error) throw error

      setGroceryList((prev) => prev.map((item) => ({ ...item, checked: true })))
      toast.success("All items marked as collected")
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all collected")
      console.error("Error marking all collected:", err)
    }
  }

  const totalCost = groceryList.reduce((sum, item) => sum + item.price, 0)
  const checkedCost = groceryList.reduce((sum, item) => (item.checked ? sum + item.price : sum), 0)
  const checkedItems = groceryList.filter((item) => item.checked).length
  const totalItems = groceryList.length
  const progressPercentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  const groupedItems = GROCERY_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = groceryList.filter((item) => item.category === category)
      return acc
    },
    {} as Record<GroceryCategory, GroceryItem[]>,
  )

  if (authLoading) return <DashboardLayout><div className="flex justify-center items-center h-screen">Loading...</div></DashboardLayout>
  if (error) return <DashboardLayout><div className="flex justify-center items-center h-screen text-red-500">{error}</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Grocery Shopping List</h1>
          <p className="text-xl text-muted-foreground">
            Your auto-generated shopping list based on this week's meal plan
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shopping List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>
                      {checkedItems} of {totalItems} items collected
                    </span>
                    <span className="font-medium">{Math.round(progressPercentage)}% complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Collected: KES {checkedCost.toFixed(2)}</span>
                    <span>Remaining: KES {(totalCost - checkedCost).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Custom Item */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Custom Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="Enter item name..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCustomItem()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        placeholder="Qty"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as GroceryCategory)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        {GROCERY_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addCustomItem} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shopping List by Category */}
            {GROCERY_CATEGORIES.map((category) => {
              const categoryItems = groupedItems[category]
              if (categoryItems.length === 0) return null

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {category}
                      <Badge variant="secondary">{categoryItems.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            item.checked ? "bg-muted/50 border-primary/20" : "bg-card border-border"
                          }`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItemChecked(item.id)}
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} • KES {item.price.toFixed(2)}
                            </div>
                            {item.recipes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.recipes.slice(0, 2).map((recipe) => (
                                  <Badge key={recipe} variant="outline" className="text-xs">
                                    {recipe}
                                  </Badge>
                                ))}
                                {item.recipes.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.recipes.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-semibold">KES {totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-semibold">KES {budget.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span
                      className={`font-semibold ${budget - totalCost >= 0 ? "text-green-600" : "text-destructive"}`}
                    >
                      KES {(budget - totalCost).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="text-sm text-muted-foreground">Adjust Budget:</label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline" onClick={() => router.push("/planner")}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Meal Plan
                </Button>
                <Button className="w-full bg-transparent" variant="outline" onClick={markAllCollected}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Collected
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    const listText = groceryList
                      .map((item) => `${item.name}: ${item.quantity} (KES ${item.price.toFixed(2)})`)
                      .join("\n")
                    navigator.clipboard.writeText(listText)
                    toast.success("Grocery list copied to clipboard")
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </CardContent>
            </Card>

            {/* Shopping Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Shop the perimeter first for fresh items</p>
                <p>• Check for sales on proteins and stock up</p>
                <p>• Buy generic brands to save 20-30%</p>
                <p>• Stick to your list to avoid impulse purchases</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
