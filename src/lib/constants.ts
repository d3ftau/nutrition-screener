import type { AdditiveTier, SortColumn } from "./types";

// Fixed set actually used by autopantry's screenerFacts.ts / additives
// seed -- not guessed, mirrors supabase/functions/_shared/recipe-filter.ts
// ALLERGEN_SYNONYMS keys.
export const ALLERGEN_TERMS = [
  "peanut", "nut", "dairy", "lactose", "gluten", "wheat",
  "egg", "soy", "shellfish", "fish", "sesame",
] as const;

export const ADDITIVE_TIERS: AdditiveTier[] = ["avoid", "caution", "contested"];

// Suitability tags -- mirrors screenerFacts.ts's
// DIET_SUITABILITY_TAG_SLUGS. ONLY Woolworths states these: Coles
// publishes no suitability statement anywhere in its payload (verified
// across its whole corpus), so requiring one of these necessarily
// narrows results to Woolworths. The UI says so rather than letting a
// store vanish silently.
export const DIET_TAGS = [
  "gluten-free", "halal", "kosher", "vegan", "vegetarian",
] as const;

// Nutrient-content and marketing claims -- the other half of what used
// to be one mixed `dietary_tags` array. Both stores state these, and the
// wording differences between them ("Low Sugar" vs "Low in Sugar") are
// already normalised to these slugs by screenerFacts.ts.
export const CLAIM_TAGS = [
  "high-fibre", "high-protein", "low-fat", "low-salt",
  "low-saturated-fat", "low-sugar", "no-added-sugars", "no-added-salt",
  "no-added-colours", "no-artificial-flavours-or-colours",
  "no-caffeine", "no-preservatives", "organic", "source-of-fibre",
  "source-of-protein", "source-of-calcium", "source-of-iron",
  "source-of-vitamin-c", "wholegrain", "low-gi", "cholesterol-free",
  "omega-3", "high-in-antioxidants",
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
