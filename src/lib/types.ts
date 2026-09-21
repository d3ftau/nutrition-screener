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
  category: string | null;
  category_top: string | null;

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
  dietary_tags: string[] | null;
  allergen_tokens: string[] | null;
  allergen_may_tokens: string[] | null;
}

export type AdditiveTier = "avoid" | "caution" | "contested";

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
