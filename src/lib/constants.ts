import type { AdditiveTier, SortColumn } from "./types";

// Fixed set actually used by autopantry's screenerFacts.ts / additives
// seed -- not guessed, mirrors supabase/functions/_shared/recipe-filter.ts
// ALLERGEN_SYNONYMS keys.
export const ALLERGEN_TERMS = [
  "peanut", "nut", "dairy", "lactose", "gluten", "wheat",
  "egg", "soy", "shellfish", "fish", "sesame",
] as const;

export const ADDITIVE_TIERS: AdditiveTier[] = ["avoid", "caution", "contested"];

// Mirrors screenerFacts.ts's KNOWN_DIETARY_TAG_SLUGS.
export const DIETARY_TAGS = [
  "gluten-free", "halal", "high-fibre", "high-protein", "kosher",
  "low-fat", "low-salt", "low-saturated-fat", "low-sugar", "no-caffeine",
  "organic", "source-of-fibre", "source-of-protein", "vegan",
  "vegetarian", "wholegrain",
] as const;

export const SORT_OPTIONS: { value: SortColumn; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "store", label: "Store" },
  { value: "price", label: "Price" },
  { value: "price_per_100g", label: "Price / 100g" },
  { value: "protein_g_per_dollar", label: "Protein / $" },
  { value: "protein_per_100kcal", label: "Protein / 100kcal" },
  { value: "protein_per_1000kj", label: "Protein / 1000kJ" },
  { value: "fibre_per_100kcal", label: "Fibre / 100kcal" },
  { value: "sugar_pct_of_carbs", label: "Sugar % of carbs" },
  { value: "satfat_pct_of_fat", label: "Sat fat % of fat" },
];

export const PAGE_SIZE = 50;
