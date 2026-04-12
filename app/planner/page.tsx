"use client"

import { useMemo, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/app/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, DollarSign, Target, Clock, Users, X } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"

// Initialize Supabase client
const supabase = createClient()

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const mealTypes = ["breakfast", "lunch", "dinner", "snack"]

type Recipe = {
  id: string
  title: string
  calories: number
  protein_g: number
  prep_time_min: number
  cost: number
  category: string
}

type PlannedMeal = {
  planned_id: string
  recipe_id: string
  title: string
  calories: number
  protein: number
  cost: number
  prepTime: number
}

type WeekPlan = {
  [day: string]: {
    [mealType: string]: PlannedMeal[]
  }
}

type DragPayload =
  | { kind: "recipe"; recipeId: string }
  | { kind: "plannedMeal"; plannedId: string; fromDay: string; fromMealType: string }

export default function PlannerPage() {
  const { user, loading: authLoading } = useAuth()
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({
    Monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    Sunday: { breakfast: [], lunch: [], dinner: [], snack: [] },
  })
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])
  const [planId, setPlanId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ day: string; mealType: string } | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogRecipe, setAddDialogRecipe] = useState<Recipe | null>(null)
  const [addDialogDay, setAddDialogDay] = useState<string>("Monday")
  const [addDialogMealType, setAddDialogMealType] = useState<string>("breakfast")
  const [lastTarget, setLastTarget] = useState<{ day: string; mealType: string } | null>(null)

  const recipesById = useMemo(() => {
    const map = new Map<string, Recipe>()
    for (const recipe of availableRecipes) map.set(recipe.id, recipe)
    return map
  }, [availableRecipes])

  // Fetch data: preferences, recipes, plan, and planned meals
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      // Step 1: Fetch or create app_preferences
      let weekStartsOn: "monday" | "sunday" = "monday"
      const { data: prefsData, error: prefsError } = await supabase
        .from("app_preferences")
        .select("week_starts_on")
        .eq("user_id", user.id)
        .maybeSingle()

      if (prefsError) {
        console.error("Fetch preferences error:", {
          message: prefsError.message,
          details: prefsError.details,
          hint: prefsError.hint,
          code: prefsError.code,
        })
        setError("Failed to fetch preferences")
        setLoading(false)
        return
      }

      if (!prefsData) {
        // Insert a default row. Avoid requesting a returned representation here, because some RLS setups
        // allow INSERT but block SELECT/RETURNING (which would surface as a confusing error).
        const { error: insertError } = await supabase
          .from("app_preferences")
          .insert({ user_id: user.id, week_starts_on: "monday" })

        if (insertError && insertError.code !== "23505") {
          console.error("Insert preferences error:", {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          })
          setError("Failed to create preferences")
          setLoading(false)
          return
        }

        weekStartsOn = "monday"
      } else {
        weekStartsOn = prefsData.week_starts_on
      }

      // Step 2: Calculate week_start_date
      const today = new Date()
      const weekday = today.getDay()
      let daysToSubtract = 0
      if (weekStartsOn === 'monday') {
        daysToSubtract = (weekday === 0 ? 6 : weekday - 1)
      } else {
        daysToSubtract = weekday
      }
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - daysToSubtract)
      const weekStartDate = weekStart.toISOString().split('T')[0]

      // Step 3: Fetch or create meal_plans
      let { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate)
        .single()
      if (planError && planError.code !== 'PGRST116') {
        console.error('Fetch meal plan error:', planError)
        setError('Failed to fetch meal plan')
        setLoading(false)
        return
      }
      if (!planData) {
        const { data: newPlan, error: createError } = await supabase
          .from('meal_plans')
          .insert({ user_id: user.id, week_start_date: weekStartDate })
          .select('id')
          .single()
        if (createError) {
          console.error('Create meal plan error:', createError)
          setError('Failed to create meal plan')
          setLoading(false)
          return
        }
        planData = newPlan
      }
      setPlanId(planData.id)

      // Step 4: Fetch recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
      if (recipesError) {
        console.error('Fetch recipes error:', recipesError)
        setError('Failed to fetch recipes')
        setLoading(false)
        return
      }
      setAvailableRecipes((recipesData || []).map(r => ({
        ...r,
        protein_g: r.protein_g || 0,
        prep_time_min: r.prep_time_min || 0,
        cost: r.cost || 0,
        calories: r.calories || 0,
      })))

      // Step 5: Fetch planned_meals
      await fetchPlannedMeals(planData.id)

      setLoading(false)
    }

    fetchData()
  }, [user])

  const fetchPlannedMeals = async (currentPlanId: string) => {
    const { data: plansData, error: plansError } = await supabase
      .from('planned_meals')
      .select(`
        id,
        day_of_week,
        meal_type,
        recipes (
          id,
          title,
          calories,
          protein_g,
          prep_time_min,
          cost
        )
      `)
      .eq('plan_id', currentPlanId)
    if (plansError) {
      console.error('Fetch planned meals error:', plansError)
      setError('Failed to fetch planned meals')
      return
    }

    const newPlan: WeekPlan = daysOfWeek.reduce((acc, day) => {
      acc[day] = mealTypes.reduce((mealAcc, type) => {
        mealAcc[type] = []
        return mealAcc
      }, {} as { [mealType: string]: PlannedMeal[] })
      return acc
    }, {} as WeekPlan)

    plansData?.forEach((plan: any) => {
      const recipe = plan.recipes
      const capitalizedDay = plan.day_of_week.charAt(0).toUpperCase() + plan.day_of_week.slice(1)
      newPlan[capitalizedDay][plan.meal_type].push({
        planned_id: plan.id,
        recipe_id: recipe.id,
        title: recipe.title,
        calories: recipe.calories,
        protein: recipe.protein_g,
        cost: recipe.cost,
        prepTime: recipe.prep_time_min,
      })
    })

    setWeekPlan(newPlan)
  }

  const addMealToPlan = async (day: string, mealType: string, recipe: Recipe) => {
    if (!user || !planId) return

    const { data, error } = await supabase
      .from('planned_meals')
      .insert({
        plan_id: planId as string,
        recipe_id: recipe.id,
        day_of_week: day.toLowerCase() as "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
        meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
        servings: 1,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Add meal error:', error)
      setError('Failed to add meal')
      return
    }

    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [
          ...prev[day][mealType],
          {
            planned_id: data.id,
            recipe_id: recipe.id,
            title: recipe.title,
            calories: recipe.calories,
            protein: recipe.protein_g,
            cost: recipe.cost,
            prepTime: recipe.prep_time_min,
          },
        ],
      },
    }))
  }

  const moveMealInPlan = async (
    plannedId: string,
    fromDay: string,
    fromMealType: string,
    toDay: string,
    toMealType: string,
  ) => {
    if (!user || !planId) return
    if (fromDay === toDay && fromMealType === toMealType) return

    const fromList = weekPlan[fromDay]?.[fromMealType] || []
    const movingMeal = fromList.find((m) => m.planned_id === plannedId)
    if (!movingMeal) return

    setWeekPlan((prev) => {
      const next = { ...prev }
      next[fromDay] = {
        ...next[fromDay],
        [fromMealType]: next[fromDay][fromMealType].filter((m) => m.planned_id !== plannedId),
      }
      next[toDay] = { ...next[toDay], [toMealType]: [...next[toDay][toMealType], movingMeal] }
      return next
    })

    const { error: updateError } = await supabase
      .from("planned_meals")
      .update({
        day_of_week: toDay.toLowerCase() as "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
        meal_type: toMealType as "breakfast" | "lunch" | "dinner" | "snack",
      })
      .eq("id", plannedId)

    if (updateError) {
      console.error("Move meal error:", updateError)
      setError("Failed to move meal")
      await fetchPlannedMeals(planId)
    }
  }

  const parseDragPayload = (event: React.DragEvent): DragPayload | null => {
    const raw = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain")
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as DragPayload
      if (!parsed || typeof parsed !== "object") return null
      if (parsed.kind === "recipe" && typeof parsed.recipeId === "string") return parsed
      if (
        parsed.kind === "plannedMeal" &&
        typeof parsed.plannedId === "string" &&
        typeof parsed.fromDay === "string" &&
        typeof parsed.fromMealType === "string"
      ) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  }

  const handleDrop = async (event: React.DragEvent, day: string, mealType: string) => {
    event.preventDefault()
    setDropTarget(null)

    const payload = parseDragPayload(event)
    if (!payload) return

    setLastTarget({ day, mealType })

    if (payload.kind === "recipe") {
      const recipe = recipesById.get(payload.recipeId)
      if (!recipe) return
      await addMealToPlan(day, mealType, recipe)
      return
    }

    await moveMealInPlan(payload.plannedId, payload.fromDay, payload.fromMealType, day, mealType)
  }

  const removeMealFromPlan = async (day: string, mealType: string, plannedId: string) => {
    if (!user || !planId) return

    const { error } = await supabase
      .from('planned_meals')
      .delete()
      .eq('id', plannedId)

    if (error) {
      console.error('Remove meal error:', error)
      setError('Failed to remove meal')
      return
    }

    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((meal) => meal.planned_id !== plannedId),
      },
    }))
  }

  const getDayTotals = (day: string) => {
    const dayMeals = Object.values(weekPlan[day]).flat()
    return {
      calories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      protein: dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      cost: dayMeals.reduce((sum, meal) => sum + (meal.cost || 0), 0),
      prepTime: dayMeals.reduce((sum, meal) => sum + (meal.prepTime || 0), 0),
    }
  }

  const getWeekTotals = () => {
    const allMeals = daysOfWeek.flatMap((day) => Object.values(weekPlan[day]).flat())
    return {
      calories: allMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      protein: allMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      cost: allMeals.reduce((sum, meal) => sum + (meal.cost || 0), 0),
      prepTime: allMeals.reduce((sum, meal) => sum + (meal.prepTime || 0), 0),
    }
  }

  if (authLoading) return <DashboardLayout><div className="flex justify-center items-center h-screen">Loading...</div></DashboardLayout>
  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-screen">Loading...</div></DashboardLayout>
  if (error) return <DashboardLayout><div className="flex justify-center items-center h-screen text-red-500">{error}</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Recipe Sidebar */}
        <div className="w-80 border-r border-border bg-card/30 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Available Recipes</h2>
            <p className="text-sm text-muted-foreground">Drag recipes to your meal plan or click to add</p>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3">
              {availableRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => {
                    const payload: DragPayload = { kind: "recipe", recipeId: recipe.id }
                    e.dataTransfer.setData("application/json", JSON.stringify(payload))
                    e.dataTransfer.setData("text/plain", JSON.stringify(payload))
                    e.dataTransfer.effectAllowed = "copy"
                  }}
                  onClick={() => {
                    const target = lastTarget ?? { day: "Monday", mealType: "breakfast" }
                    setAddDialogRecipe(recipe)
                    setAddDialogDay(target.day)
                    setAddDialogMealType(target.mealType)
                    setAddDialogOpen(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm leading-tight">{recipe.title}</h3>
                      <Badge variant="outline" className="text-xs ml-2 shrink-0">
                        {recipe.category}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {recipe.calories || 0} cal
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />KES {(recipe.cost || 0).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prep_time_min || 0}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.protein_g || 0}g protein
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Planner Area */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Weekly Meal Planner</h1>
                <p className="text-muted-foreground">Plan your meals for the week ahead</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  This Week
                </Button>
                <Button>Generate Grocery List</Button>
              </div>
            </div>

            {/* Week Summary */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Week Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{getWeekTotals().calories}</div>
                    <div className="text-muted-foreground">Total Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{getWeekTotals().protein}g</div>
                    <div className="text-muted-foreground">Total Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">KES {getWeekTotals().cost.toFixed(2)}</div>
                    <div className="text-muted-foreground">Total Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{Math.round(getWeekTotals().prepTime / 60)}h</div>
                    <div className="text-muted-foreground">Prep Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-7 gap-4">
            {daysOfWeek.map((day) => {
              const dayTotals = getDayTotals(day)
              return (
                <Card key={day} className="min-h-[600px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{day}</CardTitle>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{dayTotals.calories} cal</div>
                      <div>KES {dayTotals.cost.toFixed(2)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-4">
                      {mealTypes.map((mealType) => (
                        <div key={mealType}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium capitalize text-muted-foreground">{mealType}</h4>
                            <MealTypeAddButton
                              day={day}
                              mealType={mealType}
                              recipes={availableRecipes}
                              onPick={async (recipe) => {
                                setLastTarget({ day, mealType })
                                await addMealToPlan(day, mealType, recipe)
                              }}
                            />
                          </div>
                          <div
                            className={[
                              "space-y-2 min-h-[80px] border-2 border-dashed rounded-lg p-2 transition-colors",
                              dropTarget?.day === day && dropTarget?.mealType === mealType
                                ? "border-primary/60 bg-primary/5"
                                : "border-border/50",
                            ].join(" ")}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = "copy"
                            }}
                            onDragEnter={() => setDropTarget({ day, mealType })}
                            onDragLeave={() =>
                              setDropTarget((prev) => (prev?.day === day && prev?.mealType === mealType ? null : prev))
                            }
                            onDrop={(e) => void handleDrop(e, day, mealType)}
                          >
                            {weekPlan[day][mealType].map((meal) => (
                              <div
                                key={meal.planned_id}
                                className="bg-accent/50 rounded p-2 text-xs group relative cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={(e) => {
                                  const payload: DragPayload = {
                                    kind: "plannedMeal",
                                    plannedId: meal.planned_id,
                                    fromDay: day,
                                    fromMealType: mealType,
                                  }
                                  e.dataTransfer.setData("application/json", JSON.stringify(payload))
                                  e.dataTransfer.setData("text/plain", JSON.stringify(payload))
                                  e.dataTransfer.effectAllowed = "move"
                                }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeMealFromPlan(day, mealType, meal.planned_id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="font-medium text-foreground pr-4">{meal.title}</div>
                                <div className="text-muted-foreground mt-1">
                                  {meal.calories} cal • KES {meal.cost.toFixed(2)}
                                </div>
                              </div>
                            ))}
                            {weekPlan[day][mealType].length === 0 && (
                              <div className="text-center text-muted-foreground text-xs py-4">
                                Drop meals here or click +
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to meal plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{addDialogRecipe?.title}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Day</div>
                <Select value={addDialogDay} onValueChange={setAddDialogDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Meal type</div>
                <Select value={addDialogMealType} onValueChange={setAddDialogMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!addDialogRecipe) return
                setLastTarget({ day: addDialogDay, mealType: addDialogMealType })
                await addMealToPlan(addDialogDay, addDialogMealType, addDialogRecipe)
                setAddDialogOpen(false)
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function MealTypeAddButton({
  day,
  mealType,
  recipes,
  onPick,
}: {
  day: string
  mealType: string
  recipes: Recipe[]
  onPick: (recipe: Recipe) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const matching = useMemo(
    () => recipes.filter((r) => (r.category || "").toLowerCase() === mealType.toLowerCase()),
    [recipes, mealType],
  )
  const nonMatching = useMemo(
    () => recipes.filter((r) => (r.category || "").toLowerCase() !== mealType.toLowerCase()),
    [recipes, mealType],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Add ${mealType} on ${day}`}>
          <Plus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="end" sideOffset={6}>
        <Command>
          <CommandInput placeholder="Search recipes..." />
          <CommandList>
            <CommandEmpty>No recipes found.</CommandEmpty>
            {matching.length > 0 && (
              <CommandGroup heading="Matches this meal type">
                {matching.map((recipe) => (
                  <CommandItem
                    key={recipe.id}
                    value={`${recipe.title} ${recipe.category ?? ""}`}
                    onSelect={() => {
                      setOpen(false)
                      void onPick(recipe)
                    }}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="truncate">{recipe.title}</div>
                      {recipe.category && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {recipe.category}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading={matching.length > 0 ? "All recipes" : "Recipes"}>
              {(matching.length > 0 ? nonMatching : recipes).map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  value={`${recipe.title} ${recipe.category ?? ""}`}
                  onSelect={() => {
                    setOpen(false)
                    void onPick(recipe)
                  }}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="truncate">{recipe.title}</div>
                    {recipe.category && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {recipe.category}
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
