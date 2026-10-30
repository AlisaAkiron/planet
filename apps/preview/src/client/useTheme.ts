import { useEffect, useState } from 'react'
import type { PreviewTheme } from '../protocol'

const osTheme = (): PreviewTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

/**
 * Applies the theme the editor asked for, or the OS preference when it
 * sent none, as data-theme on <html> — what the DaisyUI themes and
 * MarkdownView's diagrams key on.
 */
export const useTheme = (requested: PreviewTheme | undefined) => {
  const [system, setSystem] = useState(osTheme)

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(osTheme())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const theme = requested ?? system
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
