/**
 * Minimal hand-written types for the `cloudflare:workers` runtime module.
 * `wrangler types` would generate the full Workers runtime globals, but
 * those conflict with the DOM lib that this project's client code needs
 * (one tsconfig type-checks both sides), so only the surface the markdown
 * render cache uses is declared. The binding is optional: non-Workers
 * contexts have no KV, and callers must treat absence as a cache miss.
 */
declare module 'cloudflare:workers' {
  interface PlanetCacheKV {
    get(key: string, type: 'json'): Promise<unknown>
    put(
      key: string,
      value: string,
      options?: { expirationTtl?: number },
    ): Promise<void>
  }
  interface AssetsFetcher {
    fetch(input: URL | Request | string): Promise<Response>
  }
  export const env: {
    PLANET_CACHE?: PlanetCacheKV
    ASSETS?: AssetsFetcher
  }
}
