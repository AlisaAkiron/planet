/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Rybbit instance API endpoint, e.g. https://rybbit.alisaqaq.moe/api */
  readonly VITE_RYBBIT_HOST: string
  /** Public Rybbit Site ID for the current environment */
  readonly VITE_RYBBIT_SITE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
