# Nutrition Screener

A personal tool for screening Woolworths, Coles and ALDI grocery
products by nutrition ratio, price, discount, and additive/allergen
content. Sits directly on top of the `product_screener` view in the
[autopantry](https://github.com/d3ftau/autopantry) Supabase project — a
static frontend querying Supabase's PostgREST API with the public anon
key (protected by row-level security, not by secrecy).

Live at https://d3ftau.github.io/nutrition-screener/

No backend of its own: every filter and sort translates directly to
PostgREST query parameters. Filters:

- **Nutrition ratio thresholds** — protein per $ / 100kcal / 1000kJ,
  price per 100g, fibre per 100kcal, sugar % of carbs, sat fat % of fat
- **Specials** — discount bands off the was-price (>50%, half price,
  40–49%, 30–39%)
- **Category** — ~49 cross-store category groups, fetched live
- **Exclude additives** by tier, and **exclude allergens** (declared
  only, never "may contain")
- **Require dietary suitability** (Woolworths-only data) and **label
  claims** (both stores)
- **Non-food, alcohol and pet food** are hidden unless asked for

Data coverage differs by store: ALDI has price and nutrition only;
dietary suitability tags exist only for Woolworths. Columns the app
needs that aren't raw product data (`discount_pct`, `product_kind`,
the price ratios) are computed in the view, in autopantry's
`supabase/migrations/`.

## Development

```
npm install
npm run dev
```

## Deploy

Pushes to `main` build and deploy to GitHub Pages automatically via
`.github/workflows/deploy.yml`.
