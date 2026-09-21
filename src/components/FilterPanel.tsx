import type { AdditiveTier, SortColumn, SortState, ThresholdFilters } from "../lib/types";
import { ADDITIVE_TIERS, ALLERGEN_TERMS, DIETARY_TAGS, SORT_OPTIONS } from "../lib/constants";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  thresholds: ThresholdFilters;
  onThresholdsChange: (t: ThresholdFilters) => void;
  excludedTiers: AdditiveTier[];
  onExcludedTiersChange: (tiers: AdditiveTier[]) => void;
  excludedAllergens: string[];
  onExcludedAllergensChange: (a: string[]) => void;
  requiredDietaryTags: string[];
  onRequiredDietaryTagsChange: (tags: string[]) => void;
  sort: SortState;
  onSortChange: (s: SortState) => void;
  showExcluded: boolean;
  onShowExcludedChange: (v: boolean) => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function NumberField({
  label, value, onChange,
}: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="threshold-field">
      <span>{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </label>
  );
}

export function FilterPanel(props: Props) {
  const t = props.thresholds;
  const set = (patch: Partial<ThresholdFilters>) => props.onThresholdsChange({ ...t, ...patch });

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <input
          className="search-box"
          type="text"
          placeholder="Search product name..."
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-section">
        <h3>Sort by</h3>
        <div className="sort-row">
          <select
            value={props.sort.column}
            onChange={(e) => props.onSortChange({ ...props.sort, column: e.target.value as SortColumn })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="dir-toggle"
            onClick={() => props.onSortChange({ ...props.sort, ascending: !props.sort.ascending })}
            title="Toggle ascending/descending"
          >
            {props.sort.ascending ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>Nutrition thresholds</h3>
        <NumberField label="Min protein / $" value={t.minProteinPerDollar} onChange={(v) => set({ minProteinPerDollar: v })} />
        <NumberField label="Min protein / 100kcal (g)" value={t.minProteinPer100Kcal} onChange={(v) => set({ minProteinPer100Kcal: v })} />
        <NumberField label="Min protein / 1000kJ (g)" value={t.minProteinPer1000Kj} onChange={(v) => set({ minProteinPer1000Kj: v })} />
        <NumberField label="Max price / 100g ($)" value={t.maxPricePer100g} onChange={(v) => set({ maxPricePer100g: v })} />
        <NumberField label="Min fibre / 100kcal (g)" value={t.minFibrePer100Kcal} onChange={(v) => set({ minFibrePer100Kcal: v })} />
        <NumberField label="Max sugar % of carbs" value={t.maxSugarPctOfCarbs} onChange={(v) => set({ maxSugarPctOfCarbs: v })} />
        <NumberField label="Max sat fat % of fat" value={t.maxSatFatPctOfFat} onChange={(v) => set({ maxSatFatPctOfFat: v })} />
      </div>

      <div className="filter-section">
        <h3>Exclude additives</h3>
        {ADDITIVE_TIERS.map((tier) => (
          <label key={tier} className="checkbox-row">
            <input
              type="checkbox"
              checked={props.excludedTiers.includes(tier)}
              onChange={() => props.onExcludedTiersChange(toggle(props.excludedTiers, tier))}
            />
            <span className={`tier-tag tier-${tier}`}>{tier}</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3>Exclude allergens (declared only)</h3>
        <div className="chip-grid">
          {ALLERGEN_TERMS.map((term) => (
            <label key={term} className="checkbox-row">
              <input
                type="checkbox"
                checked={props.excludedAllergens.includes(term)}
                onChange={() => props.onExcludedAllergensChange(toggle(props.excludedAllergens, term))}
              />
              <span>{term}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Require dietary tags</h3>
        <div className="chip-grid">
          {DIETARY_TAGS.map((tag) => (
            <label key={tag} className="checkbox-row">
              <input
                type="checkbox"
                checked={props.requiredDietaryTags.includes(tag)}
                onChange={() => props.onRequiredDietaryTagsChange(toggle(props.requiredDietaryTags, tag))}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {(props.excludedTiers.length > 0 || props.excludedAllergens.length > 0) && (
        <div className="filter-section">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={props.showExcluded}
              onChange={(e) => props.onShowExcludedChange(e.target.checked)}
            />
            <span>Show excluded rows anyway (flagged)</span>
          </label>
        </div>
      )}
    </div>
  );
}
