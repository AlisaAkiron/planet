import { Metadata } from 'next'

import { Footer } from './footer'
import { Home } from './home'

export type PlanetConfig = {
  meta: Metadata
  home: Home
  footer: Footer
}
