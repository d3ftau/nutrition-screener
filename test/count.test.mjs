// node --test test/*.test.mjs — a timed-out exact count no longer fails the search (2026-10-30):
// the rows still come back, with Postgres's estimate as the count. fetch is stubbed.
import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

let exactFails = false;
globalThis.fetch = async (_url, init) => {
  const prefer = new Headers(init?.headers).get("prefer") ?? "";
  if (prefer.includes("count=exact") && exactFails) {
    return new Response(JSON.stringify({ code: "57014", message: "canceling statement due to statement timeout" }),
      { status: 500, headers: { "content-type": "application/json" } });
  }
  const total = prefer.includes("count=estimated") ? 23120 : 32738;
  return new Response(init?.method === "HEAD" ? null : '[{"name":"p1"}]',
    { status: 200, headers: { "content-type": "application/json", "content-range": `0-0/${total}` } });
};
const server = await createServer({ appType: "custom", logLevel: "silent", server: { middlewareMode: true, hmr: false } });
const { runScreenerQuery } = await server.ssrLoadModule("/src/lib/query.ts");
test.after(() => server.close());

const state = { search: "", thresholds: { minProteinPerDollar: null, minProteinPer100Kcal: null, minProteinPer1000Kj: null,
  maxPricePer100g: null, minFibrePer100Kcal: null, maxSugarPctOfCarbs: null, maxSatFatPctOfFat: null },
  excludedTiers: [], excludedAllergens: [], requiredDietTags: [], requiredClaimTags: [], categoryGroups: [], discountBands: [],
  includeNonFood: false, sort: { column: "protein_g_per_dollar", ascending: false }, page: 0, showExcluded: false };

test("the exact count when it answers", async () => {
  exactFails = false;
  const r = await runScreenerQuery(state);
  assert.deepEqual([r.rows.length, r.totalCount, r.countIsEstimate], [1, 32738, false]);
});

test("the estimate, and the rows, when the exact count times out", async () => {
  exactFails = true;
  const r = await runScreenerQuery(state);
  assert.deepEqual([r.rows.length, r.totalCount, r.countIsEstimate], [1, 23120, true]);
});
