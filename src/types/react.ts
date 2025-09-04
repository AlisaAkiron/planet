import type { JSX } from 'react'

export type JSXElement<T extends keyof JSX.IntrinsicElements> =
  JSX.IntrinsicElements[T]
