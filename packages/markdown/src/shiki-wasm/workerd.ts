import type { LoadWasmOptions, WebAssemblyInstance } from 'shiki/core'

/** Workers: instantiate the precompiled module the bundler hands over. */
export const onigWasm: LoadWasmOptions = async importObject => {
  const { default: wasm } = await import('shiki/onig.wasm')
  const instance = await WebAssembly.instantiate(wasm, importObject)
  return instance.exports as WebAssemblyInstance
}
