import { supabase } from "./supabaseClient";
import type { AdditiveTier, CategoryGroupFacet, DiscountBand, ScreenerProduct, SortState, ThresholdFilters } from "./types";
import { DISCOUNT_BANDS, NON_FOOD_KINDS, PAGE_SIZE } from "./constants";

export interface QueryState {
  search: string;
  thresholds: ThresholdFilters;
  excludedTiers: AdditiveTier[];
  excludedAllergens: string[];
  requiredDietTags: string[];
  requiredClaimTags: string[];
  categoryGroups: string[];
  discountBands: DiscountBand[];
  includeNonFood: boolean;
  sort: SortState;
  page: number; // 0-indexed
  /** When true, excluded tiers/allergens are NOT filtered out of the
   *  query -- the caller flags them client-side instead. */
  showExcluded: boolean;
}

export interface QueryResult {
  rows: ScreenerProduct[];
  totalCount: number;
  /** The exact count timed out and this is the planner's estimate. */
  countIsEstimate: boolean;
}

// The rows (a 50-row page, milliseconds) and the exact count (every matching product,
// seconds on the free-plan database) are separate requests: a count over the anon role's
// 3 s statement timeout used to fail the whole search (2026-10-30). Now it falls back to
// Postgres's estimate, which can be ~30% off, and the results show either way.
export async function runScreenerQuery(state: QueryState): Promise<QueryResult> {
  const rowsQuery = filtered(supabase.from("product_screener").select("*"), state)
    .order(state.sort.column, { ascending: state.sort.ascending, nullsFirst: false })
    .range(state.page * PAGE_SIZE, state.page * PAGE_SIZE + PAGE_SIZE - 1);
  const count = (kind: "exact" | "estimated") =>
    filtered(supabase.from("product_screener").select("*", { count: kind, head: true }), state);

  const [rows, exact] = await Promise.all([rowsQuery, count("exact")]);
  if (rows.error) throw new Error(rows.error.message);
  if (!exact.error) return { rows: (rows.data ?? []) as ScreenerProduct[], totalCount: exact.count ?? 0, countIsEstimate: false };
  const estimate = await count("estimated");
  if (estimate.error) throw new Error(estimate.error.message);
  return { rows: (rows.data ?? []) as ScreenerProduct[], totalCount: estimate.count ?? 0, countIsEstimate: true };
}

// The same filters for the rows request and the count request.
function filtered<Q>(query: Q, state: QueryState): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase-js's builder generics don't survive a helper
  let q = query as any;

  if (!state.includeNonFood) {
    q = q.not("product_kind", "in", `(${NON_FOOD_KINDS.join(",")})`);
  }

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
  for (const tag of state.requiredDietTags) {
    q = q.contains("diet_tags", [tag]);
  }
  for (const tag of state.requiredClaimTags) {
    q = q.contains("claim_tags", [tag]);
  }
  // OR semantics, unlike the tag filters above (which AND several
  // required tags together): picking "Meat & Poultry" and "Bakery"
  // means either, not both -- a product has exactly one category_group,
  // so requiring more than one would always return nothing.
  if (state.categoryGroups.length > 0) {
    q = q.in("category_group", state.categoryGroups);
  }

  // OR semantics, same reasoning as categories: a product has one
  // discount, so several picked bands mean "any of these". Each band is
  // one and(...) group so non-adjacent picks (">50%" + "30-39%") work.
  if (state.discountBands.length > 0) {
    const groups = DISCOUNT_BANDS
      .filter((b) => state.discountBands.includes(b.value))
      .map((b) => b.max === null
        ? `discount_pct.gte.${b.min}`
        : `and(discount_pct.gte.${b.min},discount_pct.lte.${b.max})`);
    q = q.or(groups.join(","));
  }
  return q;
}

/** category_group is scrape-derived, not a fixed enum, so the filter's
 *  option list is fetched live rather than hardcoded -- see
 *  product_screener_category_groups' own migration comment. Fetched
 *  once on mount, not on every query: the facet counts drifting
 *  slightly stale during a session is a fine trade against re-fetching
 *  them per keystroke. */
export async function fetchCategoryGroupFacets(): Promise<CategoryGroupFacet[]> {
  const { data, error } = await supabase
    .from("product_screener_category_groups")
    .select("*")
    .order("product_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CategoryGroupFacet[];
}
