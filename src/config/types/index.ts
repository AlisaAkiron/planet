import type { Metadata } from 'next'

import type { Footer } from './footer'
import type { Home } from './home'

export type PlanetConfig = {
  meta: Metadata
  home: Home
  footer: Footer
}
