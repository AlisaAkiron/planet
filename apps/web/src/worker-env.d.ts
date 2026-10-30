/**
 * Bindings the markdown render cache reads from `cloudflare:workers`. Kept
 * here rather than in the generated worker-configuration.d.ts (regenerated
 * by `pnpm cf-typegen`, which drops manual edits) and merged into the
 * generated empty `Cloudflare.Env`. Both are optional: non-Workers contexts
 * (local node, plain dev) have no bindings, and callers treat absence as a
 * cache miss / plain fetch fallback — hence `wrangler types --include-env
 * false`, so these stay optional instead of the generated required shape.
 */
declare namespace Cloudflare {
  interface Env {
    PLANET_CACHE?: KVNamespace
    ASSETS?: Fetcher
  }
}
