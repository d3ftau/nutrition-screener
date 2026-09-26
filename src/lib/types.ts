export interface ScreenerProduct {
  store: string;
  retailer_product_id: string;
  name: string;
  url: string | null;
  price: number | null;
  was_price: number | null;
  on_special: boolean | null;
  package_size: string | null;
  package_weight_grams: number | null;
  // Declared net contents -- the denominator for every price ratio.
  // package_weight_grams above is GROSS shipped mass on Woolworths rows
  // and is NOT interchangeable with it.
  net_content_grams: number | null;
  net_content_basis: string | null;
  category: string | null;
  category_top: string | null;
  // Cross-store canonical group ("Frozen Fish & Seafood" covers both
  // Coles' own value AND Woolworths' "FREEZER - FISH"). category_top
  // stays per-store; this is what the category filter uses.
  category_group: string | null;

  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  sugars_per_100g: number | null;
  saturated_fat_per_100g: number | null;
  fibre_per_100g: number | null;
  sodium_per_100g_mg: number | null;

  kj_per_100g: number | null;
  protein_per_100kcal: number | null;
  protein_per_1000kj: number | null;
  sugar_pct_of_carbs: number | null;
  satfat_pct_of_fat: number | null;
  fibre_per_100kcal: number | null;
  price_per_100g: number | null;
  price_per_100kcal: number | null;
  protein_g_per_dollar: number | null;

  additive_slugs: string[] | null;
  additive_tiers: string[] | null;
  additive_count: number | null;
  diet_tags: string[] | null;
  claim_tags: string[] | null;
  allergen_tokens: string[] | null;
  allergen_may_tokens: string[] | null;
}

export type AdditiveTier = "avoid" | "caution" | "contested";

/** One row per canonical category_group -- fetched live, never
 *  hardcoded, same reasoning as before (scrape-derived, not a
 *  code-level enum), but now genuinely cross-store: a given group
 *  covers whichever stores actually have products in it, so there's no
 *  per-store grouping needed in the UI any more (autopantry migration
 *  20260926010000 -- category_top's own per-store vocabulary is hand-
 *  mapped onto ~49 shared names there). */
export interface CategoryGroupFacet {
  category_group: string;
  product_count: number;
}

/** Every threshold filter is a bound on one ratio column: minimums for
 *  "more is better" metrics, maximums for "less is better" ones. */
export interface ThresholdFilters {
  minProteinPerDollar: number | null;
  minProteinPer100Kcal: number | null;
  minProteinPer1000Kj: number | null;
  maxPricePer100g: number | null;
  minFibrePer100Kcal: number | null;
  maxSugarPctOfCarbs: number | null;
  maxSatFatPctOfFat: number | null;
}

export const EMPTY_THRESHOLDS: ThresholdFilters = {
  minProteinPerDollar: null,
  minProteinPer100Kcal: null,
  minProteinPer1000Kj: null,
  maxPricePer100g: null,
  minFibrePer100Kcal: null,
  maxSugarPctOfCarbs: null,
  maxSatFatPctOfFat: null,
};

export type SortColumn =
  | "name"
  | "store"
  | "price"
  | "price_per_100g"
  | "protein_g_per_dollar"
  | "protein_per_100kcal"
  | "protein_per_1000kj"
  | "fibre_per_100kcal"
  | "sugar_pct_of_carbs"
  | "satfat_pct_of_fat";

export interface SortState {
  column: SortColumn;
  ascending: boolean;
}
