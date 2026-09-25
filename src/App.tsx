import { useEffect, useState } from "react";
import "./App.css";
import { FilterPanel } from "./components/FilterPanel";
import { ResultsTable } from "./components/ResultsTable";
import { EMPTY_THRESHOLDS } from "./lib/types";
import type { AdditiveTier, CategoryFacet, ScreenerProduct, SortState, ThresholdFilters } from "./lib/types";
import { fetchCategoryFacets, runScreenerQuery } from "./lib/query";
import { PAGE_SIZE } from "./lib/constants";

function App() {
  const [search, setSearch] = useState("");
  const [thresholds, setThresholds] = useState<ThresholdFilters>(EMPTY_THRESHOLDS);
  const [excludedTiers, setExcludedTiers] = useState<AdditiveTier[]>([]);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [requiredDietTags, setRequiredDietTags] = useState<string[]>([]);
  const [requiredClaimTags, setRequiredClaimTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFacets, setCategoryFacets] = useState<CategoryFacet[]>([]);
  const [showExcluded, setShowExcluded] = useState(false);
  const [sort, setSort] = useState<SortState>({ column: "protein_g_per_dollar", ascending: false });
  const [page, setPage] = useState(0);

  const [rows, setRows] = useState<ScreenerProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetched once, not part of the debounced query effect below -- the
  // facet LIST (which categories exist) changes on a much slower cadence
  // than the RESULTS do, and re-fetching it per keystroke would be pure
  // waste for something that's the same 27 rows either way.
  useEffect(() => {
    fetchCategoryFacets()
      .then(setCategoryFacets)
      .catch((e) => console.error("Failed to load category facets:", e));
  }, []);

  // Any filter/sort change resets to page 0 -- stale pagination against
  // a new result set would show a confusing "no rows" or wrong slice.
  useEffect(() => {
    setPage(0);
  }, [search, thresholds, excludedTiers, excludedAllergens, requiredDietTags, requiredClaimTags, categories, showExcluded, sort]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      runScreenerQuery({
        search, thresholds, excludedTiers, excludedAllergens, requiredDietTags, requiredClaimTags,
        categories, sort, page, showExcluded,
      })
        .then((result) => {
          if (cancelled) return;
          setRows(result.rows);
          setTotalCount(result.totalCount);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300); // debounce, mainly for the search box and number inputs

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, thresholds, excludedTiers, excludedAllergens, requiredDietTags, requiredClaimTags, categories, showExcluded, sort, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Nutrition Screener</h1>
        <p className="subtitle">
          {totalCount.toLocaleString()} matching products. Additive, allergen and
          label-claim data covers Woolworths and Coles; ALDI shows price and
          nutrition only. Dietary suitability tags are Woolworths-only — Coles
          does not publish them.
        </p>
      </header>

      <div className="app-body">
        <FilterPanel
          search={search} onSearchChange={setSearch}
          thresholds={thresholds} onThresholdsChange={setThresholds}
          excludedTiers={excludedTiers} onExcludedTiersChange={setExcludedTiers}
          excludedAllergens={excludedAllergens} onExcludedAllergensChange={setExcludedAllergens}
          requiredDietTags={requiredDietTags} onRequiredDietTagsChange={setRequiredDietTags}
          requiredClaimTags={requiredClaimTags} onRequiredClaimTagsChange={setRequiredClaimTags}
          categoryFacets={categoryFacets} categories={categories} onCategoriesChange={setCategories}
          sort={sort} onSortChange={setSort}
          showExcluded={showExcluded} onShowExcludedChange={setShowExcluded}
        />

        <main className="results-pane">
          {error && <p className="error-banner">Query failed: {error}</p>}
          {loading && <p className="loading-banner">Loading…</p>}
          <ResultsTable
            rows={rows}
            excludedTiers={excludedTiers}
            excludedAllergens={excludedAllergens}
            showExcluded={showExcluded}
          />
          {totalCount > PAGE_SIZE && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
