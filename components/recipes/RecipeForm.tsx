"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Clock, DollarSign, Image as ImageIcon, ListOrdered, Plus, Tag, Trash2, Users } from "lucide-react"
import { GROCERY_CATEGORIES, type GroceryCategory } from "@/lib/grocery-categories"

export type RecipeDifficulty = "easy" | "medium" | "hard"
export type RecipeCategory = "breakfast" | "lunch" | "dinner"

export type RecipeIngredientInput = {
  name: string
  quantity: string
  category: string
  price: number
}

export type RecipeFormValues = {
  title: string
  description: string
  image_url: string
  prep_time_min: number
  servings: number
  cost: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  difficulty: RecipeDifficulty
  category: RecipeCategory
  tags: string[]
  instructions: string[]
  ingredients: RecipeIngredientInput[]
}

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function cleanValues(values: RecipeFormValues) {
  const ingredients = (values.ingredients ?? [])
    .map((ing) => ({
      name: ing.name.trim(),
      quantity: ing.quantity.trim(),
      category: ing.category.trim(),
      price: Number.isFinite(ing.price) ? ing.price : 0,
    }))
    .filter((ing) => ing.name.length > 0 || ing.quantity.length > 0 || ing.category.length > 0 || ing.price > 0)

  const instructions = (values.instructions ?? []).map((s) => s.trim()).filter(Boolean)
  const tags = (values.tags ?? []).map(normalizeTag).filter(Boolean)

  return {
    ...values,
    title: values.title.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    prep_time_min: Number.isFinite(values.prep_time_min) ? values.prep_time_min : 0,
    servings: Number.isFinite(values.servings) ? values.servings : 1,
    cost: Number.isFinite(values.cost) ? values.cost : 0,
    calories: Number.isFinite(values.calories) ? values.calories : 0,
    protein_g: Number.isFinite(values.protein_g) ? values.protein_g : 0,
    carbs_g: Number.isFinite(values.carbs_g) ? values.carbs_g : 0,
    fat_g: Number.isFinite(values.fat_g) ? values.fat_g : 0,
    ingredients,
    instructions,
    tags,
  }
}

const emptyIngredient: RecipeIngredientInput = { name: "", quantity: "", category: "", price: 0 }

export default function RecipeForm({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
}: {
  title: string
  description?: string
  submitLabel: string
  initialValues?: Partial<RecipeFormValues>
  onSubmit: (values: RecipeFormValues) => Promise<void>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagDraft, setTagDraft] = useState("")

  const [values, setValues] = useState<RecipeFormValues>(() => ({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    image_url: initialValues?.image_url ?? "",
    prep_time_min: initialValues?.prep_time_min ?? 0,
    servings: initialValues?.servings ?? 1,
    cost: initialValues?.cost ?? 0,
    calories: initialValues?.calories ?? 0,
    protein_g: initialValues?.protein_g ?? 0,
    carbs_g: initialValues?.carbs_g ?? 0,
    fat_g: initialValues?.fat_g ?? 0,
    difficulty: initialValues?.difficulty ?? "easy",
    category: initialValues?.category ?? "lunch",
    tags: initialValues?.tags ?? [],
    instructions: initialValues?.instructions?.length ? initialValues.instructions : [""],
    ingredients: initialValues?.ingredients?.length ? initialValues.ingredients : [emptyIngredient],
  }))

  const preview = useMemo(() => {
    const cleaned = cleanValues(values)
    return {
      title: cleaned.title || "Untitled recipe",
      description: cleaned.description || "Add a short description…",
      imageUrl: cleaned.image_url || "",
      meta: {
        prep: cleaned.prep_time_min || 0,
        servings: cleaned.servings || 1,
        cost: cleaned.cost || 0,
      },
      badges: {
        category: cleaned.category,
        difficulty: cleaned.difficulty,
      },
      counts: {
        tags: cleaned.tags.length,
        ingredients: cleaned.ingredients.length,
        steps: cleaned.instructions.length,
      },
    }
  }, [values])

  const addTag = (raw: string) => {
    const next = normalizeTag(raw)
    if (!next) return
    setValues((prev) => {
      const exists = (prev.tags ?? []).some((t) => t.toLowerCase() === next.toLowerCase())
      if (exists) return prev
      return { ...prev, tags: [...(prev.tags ?? []), next] }
    })
    setTagDraft("")
  }

  const removeTag = (tag: string) => {
    setValues((prev) => ({ ...prev, tags: (prev.tags ?? []).filter((t) => t !== tag) }))
  }

  const updateIngredient = (index: number, patch: Partial<RecipeIngredientInput>) => {
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)),
    }))
  }

  const addIngredient = () => {
    setValues((prev) => ({ ...prev, ingredients: [...prev.ingredients, { ...emptyIngredient }] }))
  }

  const removeIngredient = (index: number) => {
    setValues((prev) => {
      const next = prev.ingredients.filter((_, i) => i !== index)
      return { ...prev, ingredients: next.length ? next : [{ ...emptyIngredient }] }
    })
  }

  const updateInstruction = (index: number, value: string) => {
    setValues((prev) => ({
      ...prev,
      instructions: prev.instructions.map((s, i) => (i === index ? value : s)),
    }))
  }

  const addInstruction = () => {
    setValues((prev) => ({ ...prev, instructions: [...prev.instructions, ""] }))
  }

  const removeInstruction = (index: number) => {
    setValues((prev) => {
      const next = prev.instructions.filter((_, i) => i !== index)
      return { ...prev, instructions: next.length ? next : [""] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = cleanValues(values)

    if (!cleaned.title) {
      toast.error("Please add a recipe title")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...cleaned,
        image_url: cleaned.image_url ? cleaned.image_url : "",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:flex-1">
            <Card className="border-muted/60">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="basics" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="basics">Basics</TabsTrigger>
                      <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="steps">Steps</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basics" className="space-y-5 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={values.title}
                            onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g., Garlic Lemon Chicken"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={values.category}
                              onValueChange={(value: RecipeCategory) => setValues((p) => ({ ...p, category: value }))}
                            >
                              <SelectTrigger id="category">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breakfast">Breakfast</SelectItem>
                                <SelectItem value="lunch">Lunch</SelectItem>
                                <SelectItem value="dinner">Dinner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                              value={values.difficulty}
                              onValueChange={(value: RecipeDifficulty) => setValues((p) => ({ ...p, difficulty: value }))}
                            >
                              <SelectTrigger id="difficulty">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={values.description}
                          onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
                          placeholder="What makes this recipe great?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL (optional)</Label>
                        <Input
                          id="imageUrl"
                          value={values.image_url}
                          onChange={(e) => setValues((p) => ({ ...p, image_url: e.target.value }))}
                          placeholder="https://..."
                        />
                        {values.image_url.trim() ? (
                          <div className="mt-3 overflow-hidden rounded-lg border bg-card">
                            <img
                              src={values.image_url.trim()}
                              alt="Recipe preview"
                              className="h-44 w-full object-cover"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLImageElement).style.display = "none"
                              }}
                              onLoad={(e) => {
                                ;(e.currentTarget as HTMLImageElement).style.display = "block"
                              }}
                            />
                          </div>
                        ) : null}
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prepTime">Prep time (min)</Label>
                          <Input
                            id="prepTime"
                            type="number"
                            min={0}
                            value={values.prep_time_min}
                            onChange={(e) => setValues((p) => ({ ...p, prep_time_min: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="servings">Servings</Label>
                          <Input
                            id="servings"
                            type="number"
                            min={1}
                            value={values.servings}
                            onChange={(e) => setValues((p) => ({ ...p, servings: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cost">Estimated cost (KES)</Label>
                          <Input
                            id="cost"
                            type="number"
                            min={0}
                            step="0.01"
                            value={values.cost}
                            onChange={(e) => setValues((p) => ({ ...p, cost: Number(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            placeholder="e.g., meal prep, high protein"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addTag(tagDraft)
                              }
                            }}
                          />
                          <Button type="button" variant="secondary" onClick={() => addTag(tagDraft)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        {(values.tags?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {values.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="gap-1">
                                {t}
                                <button
                                  type="button"
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                  onClick={() => removeTag(t)}
                                  aria-label={`Remove tag ${t}`}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Add tags to make recipes easier to find.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="nutrition" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            min={0}
                            value={values.calories}
                            onChange={(e) => setValues((p) => ({ ...p, calories: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            min={0}
                            value={values.protein_g}
                            onChange={(e) => setValues((p) => ({ ...p, protein_g: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            min={0}
                            value={values.carbs_g}
                            onChange={(e) => setValues((p) => ({ ...p, carbs_g: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            min={0}
                            value={values.fat_g}
                            onChange={(e) => setValues((p) => ({ ...p, fat_g: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tip: enter nutrition values per serving for the most accurate meal planning.
                      </p>
                    </TabsContent>

                    <TabsContent value="ingredients" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Ingredients</h3>
                          <p className="text-sm text-muted-foreground">Add quantities, category, and cost estimates.</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={addIngredient}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add ingredient
                        </Button>
                      </div>

                      <div className="rounded-lg border bg-card">
                        <ScrollArea className="max-h-[420px]">
                          <div className="p-3 space-y-3">
                            {values.ingredients.map((ing, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-3 space-y-2">
                                  <Label>Quantity</Label>
                                  <Input
                                    value={ing.quantity}
                                    onChange={(e) => updateIngredient(idx, { quantity: e.target.value })}
                                    placeholder="e.g., 200g, 1 cup"
                                  />
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={ing.name}
                                    onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                                    placeholder="e.g., rice"
                                  />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                  <Label>Category</Label>
                                  {(() => {
                                    const current = (ing.category || "").trim()
                                    const value = (current || "Other") as GroceryCategory | string
                                    const inList = GROCERY_CATEGORIES.includes(value as GroceryCategory)
                                    return (
                                      <Select value={value} onValueChange={(v) => updateIngredient(idx, { category: v })}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {!inList && current ? (
                                            <SelectItem value={current}>
                                              {current} (current)
                                            </SelectItem>
                                          ) : null}
                                          {GROCERY_CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                              {c}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )
                                  })()}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <Label>Price (KES)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={ing.price}
                                    onChange={(e) => updateIngredient(idx, { price: Number(e.target.value) })}
                                  />
                                </div>
                                <div className="md:col-span-12 flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => removeIngredient(idx)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>
                                {idx !== values.ingredients.length - 1 ? <Separator className="md:col-span-12" /> : null}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    <TabsContent value="steps" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Instructions</h3>
                          <p className="text-sm text-muted-foreground">Write short, actionable steps.</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={addInstruction}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add step
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {values.instructions.map((step, idx) => (
                          <Card key={idx} className="border-muted/60">
                            <CardHeader className="py-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold">Step {idx + 1}</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeInstruction(idx)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <Textarea
                                value={step}
                                onChange={(e) => updateInstruction(idx, e.target.value)}
                                placeholder="Describe what to do…"
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => router.push("/recipes")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-[360px] lg:sticky lg:top-6">
            <Card className="border-muted/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>How this will look in your library.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  {preview.imageUrl ? (
                    <img src={preview.imageUrl} alt="Preview" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      No image
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-semibold leading-tight">{preview.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{preview.description}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{preview.badges.category}</Badge>
                  <Badge variant="outline">{preview.badges.difficulty}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {preview.meta.prep}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {preview.meta.servings}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" /> KES {preview.meta.cost.toFixed(0)}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{preview.counts.tags}</div>
                      <div className="text-xs text-muted-foreground">tags</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{preview.counts.ingredients}</div>
                      <div className="text-xs text-muted-foreground">items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{preview.counts.steps}</div>
                      <div className="text-xs text-muted-foreground">steps</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
