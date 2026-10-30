import type { LoadWasmOptions } from 'shiki/core'

/**
 * Everywhere but Workers: shiki's own loader, which inlines the binary
 * as base64 and compiles it at runtime.
 */
export const onigWasm: LoadWasmOptions = () => import('shiki/wasm')
