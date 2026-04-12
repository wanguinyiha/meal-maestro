export const GROCERY_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Grains & Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Other",
] as const

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number]

