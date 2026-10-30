// The Cloudflare Vite plugin imports .wasm files as precompiled modules
// (Workers can't compile WASM from bytes at runtime); shiki ships no types
// for this entry.
declare module 'shiki/onig.wasm' {
  const wasm: WebAssembly.Module
  export default wasm
}
