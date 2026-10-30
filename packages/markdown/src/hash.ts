const toHex = (bytes: Uint8Array) =>
  [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')

/** SHA-256 of a UTF-8 string as lowercase hex. Needs WebCrypto. */
export const sha256Hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  )
  return toHex(new Uint8Array(digest))
}

/** cyrb53: a fast 53-bit string hash (public domain, bryc). */
const cyrb53 = (input: string, seed: number): number => {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/**
 * Hash for the renderer's cache keys: SHA-256 wherever WebCrypto exists.
 * It exists only in secure contexts, and an iframe inside an insecure
 * parent isn't one — so an embedded browser-mode preview may lack it.
 * There, two seeded cyrb53 hashes (106 bits) stand in: such a render's
 * cache is in-memory and private to the page, so keys only need to avoid
 * accidental collisions, never to resist crafted ones.
 */
export const cacheKeyHash = (input: string): Promise<string> =>
  globalThis.crypto?.subtle
    ? sha256Hex(input)
    : Promise.resolve(
        cyrb53(input, 0).toString(16).padStart(14, '0') +
          cyrb53(input, 1).toString(16).padStart(14, '0'),
      )
