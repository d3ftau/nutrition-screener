// node --test test/*.test.mjs — both halves of "this row is excluded": the filters runScreenerQuery
// sends (fetch stubbed, nothing leaves the box) and the flag ResultsTable draws with showExcluded on.
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const urls = [];
globalThis.fetch = async (url) => {
  urls.push(decodeURIComponent(String(url)));
  return new Response("[]", { status: 200, headers: { "content-type": "application/json", "content-range": "0-0/0" } });
};
const server = await createServer({ appType: "custom", logLevel: "silent", server: { middlewareMode: true, hmr: false } });
const { runScreenerQuery } = await server.ssrLoadModule("/src/lib/query.ts");
const { ResultsTable } = await server.ssrLoadModule("/src/components/ResultsTable.tsx");
test.after(() => server.close());

const thresholds = { minProteinPerDollar: null, minProteinPer100Kcal: null, minProteinPer1000Kj: null, maxPricePer100g: null,
  minFibrePer100Kcal: null, maxSugarPctOfCarbs: null, maxSatFatPctOfFat: null };
const state = (over) => ({ search: "", thresholds, excludedTiers: ["avoid"], excludedAllergens: ["peanut"], requiredDietTags: [],
  requiredClaimTags: [], categoryGroups: [], discountBands: [], includeNonFood: true, sort: { column: "name", ascending: true },
  page: 0, showExcluded: false, ...over });

test("exclusions go to the server when showExcluded is off, and none when it's on", async () => {
  await runScreenerQuery(state({}));
  assert.match(urls.at(-1), /additive_tiers.*avoid/);
  assert.match(urls.at(-1), /allergen_tokens.*peanut/);
  await runScreenerQuery(state({ showExcluded: true }));
  assert.doesNotMatch(urls.at(-1), /additive_tiers|allergen_tokens/);
});

const row = (id, additive_tiers, allergen_tokens) => ({ store: "woolworths", retailer_product_id: id, name: `p${id}`, url: null,
  price: 1, discount_pct: null, price_per_100g: null, protein_g_per_dollar: null, protein_per_100kcal: null,
  protein_per_1000kj: null, fibre_per_100kcal: null, sugar_pct_of_carbs: null, satfat_pct_of_fat: null,
  additive_tiers, allergen_tokens });

function flaggedNames(rows, showExcluded) {
  const html = renderToStaticMarkup(createElement(ResultsTable,
    { rows, excludedTiers: ["avoid"], excludedAllergens: ["peanut"], showExcluded }));
  return [...html.matchAll(/<tr class="flagged-row"><td class="name-cell">([^<]+)</g)].map((m) => m[1]);
}

test("with showExcluded on, exactly the rows the server would have dropped are flagged", () => {
  const rows = [row(1, ["avoid"], []), row(2, [], ["peanut", "soy"]), row(3, ["caution"], ["soy"]),
    row(4, null, null)];  // no data (ALDI): unknown, so flagged, as the server drops it
  assert.deepEqual(flaggedNames(rows, true), ["p1", "p2", "p4"]);
  assert.deepEqual(flaggedNames(rows, false), []);
});
