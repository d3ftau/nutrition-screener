import type { AdditiveTier, ScreenerProduct } from "../lib/types";

interface Props {
  rows: ScreenerProduct[];
  excludedTiers: AdditiveTier[];
  excludedAllergens: string[];
  showExcluded: boolean;
}

function fmt(n: number | null, digits = 2): string {
  return n === null || n === undefined ? "—" : n.toFixed(digits);
}

function isFlagged(row: ScreenerProduct, excludedTiers: AdditiveTier[], excludedAllergens: string[]): boolean {
  const tiers = row.additive_tiers ?? [];
  const allergens = row.allergen_tokens ?? [];
  return excludedTiers.some((t) => tiers.includes(t)) || excludedAllergens.some((a) => allergens.includes(a));
}

export function ResultsTable({ rows, excludedTiers, excludedAllergens, showExcluded }: Props) {
  if (rows.length === 0) {
    return <p className="empty-state">No products match these filters.</p>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Store</th>
            <th>Price</th>
            <th>$/100g</th>
            <th>Protein/$</th>
            <th>Protein/100kcal</th>
            <th>Protein/1000kJ</th>
            <th>Fibre/100kcal</th>
            <th>Sugar% carbs</th>
            <th>SatFat% fat</th>
            <th>Additives</th>
            <th>Allergens</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const flagged = showExcluded && isFlagged(r, excludedTiers, excludedAllergens);
            return (
              <tr key={`${r.store}:${r.retailer_product_id}`} className={flagged ? "flagged-row" : ""}>
                <td className="name-cell">
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a> : r.name}
                </td>
                <td>{r.store}</td>
                <td>{r.price !== null ? `$${r.price.toFixed(2)}` : "—"}</td>
                <td>{r.price_per_100g !== null ? `$${fmt(r.price_per_100g)}` : "—"}</td>
                <td>{fmt(r.protein_g_per_dollar, 1)}</td>
                <td>{fmt(r.protein_per_100kcal, 1)}</td>
                <td>{fmt(r.protein_per_1000kj, 1)}</td>
                <td>{fmt(r.fibre_per_100kcal, 1)}</td>
                <td>{r.sugar_pct_of_carbs !== null ? `${fmt(r.sugar_pct_of_carbs, 0)}%` : "—"}</td>
                <td>{r.satfat_pct_of_fat !== null ? `${fmt(r.satfat_pct_of_fat, 0)}%` : "—"}</td>
                <td>
                  {(r.additive_tiers ?? []).map((tier, i) => (
                    <span key={i} className={`tier-tag tier-${tier}`}>{tier}</span>
                  ))}
                </td>
                <td>
                  {(r.allergen_tokens ?? []).map((a) => (
                    <span key={a} className="allergen-tag">{a}</span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
