import { supabase } from "./supabaseClient";
import type { AdditiveTier, ScreenerProduct, SortState, ThresholdFilters } from "./types";
import { PAGE_SIZE } from "./constants";

export interface QueryState {
  search: string;
  thresholds: ThresholdFilters;
  excludedTiers: AdditiveTier[];
  excludedAllergens: string[];
  requiredDietaryTags: string[];
  sort: SortState;
  page: number; // 0-indexed
  /** When true, excluded tiers/allergens are NOT filtered out of the
   *  query -- the caller flags them client-side instead. */
  showExcluded: boolean;
}

export interface QueryResult {
  rows: ScreenerProduct[];
  totalCount: number;
}

export async function runScreenerQuery(state: QueryState): Promise<QueryResult> {
  let q = supabase.from("product_screener").select("*", { count: "exact" });

  if (state.search.trim().length > 0) {
    q = q.ilike("name", `%${state.search.trim()}%`);
  }

  const t = state.thresholds;
  if (t.minProteinPerDollar !== null) q = q.gte("protein_g_per_dollar", t.minProteinPerDollar);
  if (t.minProteinPer100Kcal !== null) q = q.gte("protein_per_100kcal", t.minProteinPer100Kcal);
  if (t.minProteinPer1000Kj !== null) q = q.gte("protein_per_1000kj", t.minProteinPer1000Kj);
  if (t.maxPricePer100g !== null) q = q.lte("price_per_100g", t.maxPricePer100g);
  if (t.minFibrePer100Kcal !== null) q = q.gte("fibre_per_100kcal", t.minFibrePer100Kcal);
  if (t.maxSugarPctOfCarbs !== null) q = q.lte("sugar_pct_of_carbs", t.maxSugarPctOfCarbs);
  if (t.maxSatFatPctOfFat !== null) q = q.lte("satfat_pct_of_fat", t.maxSatFatPctOfFat);

  // Excluding a tier/allergen means: rows whose array contains it are
  // dropped. `not.cs.{value}` = "array does NOT contain value". Several
  // excluded tiers/allergens AND together (kept only if NONE match).
  // Skipped entirely when showExcluded is on -- the caller flags matches
  // client-side instead of the DB dropping them.
  if (!state.showExcluded) {
    for (const tier of state.excludedTiers) {
      q = q.not("additive_tiers", "cs", `{${tier}}`);
    }
    // Definite allergen tokens only -- may-contain is deliberately never
    // filtered (Greg's call, 2026-09-21): a "may contain traces" warning
    // is not the same confidence level as a declared ingredient, and
    // silently dropping on it would hide products a household member
    // might genuinely be fine with.
    for (const allergen of state.excludedAllergens) {
      q = q.not("allergen_tokens", "cs", `{${allergen}}`);
    }
  }
  for (const tag of state.requiredDietaryTags) {
    q = q.contains("dietary_tags", [tag]);
  }

  q = q.order(state.sort.column, { ascending: state.sort.ascending, nullsFirst: false });

  const from = state.page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  q = q.range(from, to);

  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: (data ?? []) as ScreenerProduct[], totalCount: count ?? 0 };
}
