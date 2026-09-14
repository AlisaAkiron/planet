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

// The Cloudflare Vite plugin imports .wasm files as precompiled modules
// (Workers can't compile WASM from bytes at runtime); shiki ships none.
declare module 'shiki/onig.wasm' {
  const wasm: WebAssembly.Module
  export default wasm
}
