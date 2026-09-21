# Nutrition Screener

A personal tool for screening Woolworths (and, as other stores get real
data, more) grocery products by nutrition ratio, price, and additive/
allergen content. Sits directly on top of the `product_screener` view
in the [autopantry](https://github.com/d3ftau/autopantry) Supabase
project — a static frontend querying Supabase's PostgREST API with the
public anon key (protected by row-level security, not by secrecy).

No backend of its own: filtering (nutrition ratio thresholds, additive
tier exclusion, allergen exclusion, dietary tag requirements), sorting,
and search all translate directly to PostgREST query parameters.

## Development

```
npm install
npm run dev
```

## Deploy

Pushes to `main` build and deploy to GitHub Pages automatically via
`.github/workflows/deploy.yml`.
