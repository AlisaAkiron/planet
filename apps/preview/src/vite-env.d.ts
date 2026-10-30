/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Build target, set by vite.config.ts from PREVIEW_TARGET. */
  readonly PREVIEW_TARGET: 'server' | 'static'
  /** Static builds only: allowed parent origins, comma-separated. */
  readonly VITE_PREVIEW_ALLOWED_ORIGINS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
