import { useEffect, useState } from "react";
import "./App.css";
import { FilterPanel } from "./components/FilterPanel";
import { ResultsTable } from "./components/ResultsTable";
import { EMPTY_THRESHOLDS } from "./lib/types";
import type { AdditiveTier, ScreenerProduct, SortState, ThresholdFilters } from "./lib/types";
import { runScreenerQuery } from "./lib/query";
import { PAGE_SIZE } from "./lib/constants";

function App() {
  const [search, setSearch] = useState("");
  const [thresholds, setThresholds] = useState<ThresholdFilters>(EMPTY_THRESHOLDS);
  const [excludedTiers, setExcludedTiers] = useState<AdditiveTier[]>([]);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [requiredDietaryTags, setRequiredDietaryTags] = useState<string[]>([]);
  const [showExcluded, setShowExcluded] = useState(false);
  const [sort, setSort] = useState<SortState>({ column: "protein_g_per_dollar", ascending: false });
  const [page, setPage] = useState(0);

  const [rows, setRows] = useState<ScreenerProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Any filter/sort change resets to page 0 -- stale pagination against
  // a new result set would show a confusing "no rows" or wrong slice.
  useEffect(() => {
    setPage(0);
  }, [search, thresholds, excludedTiers, excludedAllergens, requiredDietaryTags, showExcluded, sort]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      runScreenerQuery({
        search, thresholds, excludedTiers, excludedAllergens, requiredDietaryTags,
        sort, page, showExcluded,
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
  }, [search, thresholds, excludedTiers, excludedAllergens, requiredDietaryTags, showExcluded, sort, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Nutrition Screener</h1>
        <p className="subtitle">
          {totalCount.toLocaleString()} matching products. Additive/allergen/dietary data is Woolworths-only for now — other stores show price and nutrition only.
        </p>
      </header>

      <div className="app-body">
        <FilterPanel
          search={search} onSearchChange={setSearch}
          thresholds={thresholds} onThresholdsChange={setThresholds}
          excludedTiers={excludedTiers} onExcludedTiersChange={setExcludedTiers}
          excludedAllergens={excludedAllergens} onExcludedAllergensChange={setExcludedAllergens}
          requiredDietaryTags={requiredDietaryTags} onRequiredDietaryTagsChange={setRequiredDietaryTags}
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
