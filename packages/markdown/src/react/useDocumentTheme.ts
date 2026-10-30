import { useSyncExternalStore } from 'react'

export type DocumentTheme = 'light' | 'dark'

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

const getSnapshot = (): DocumentTheme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

/**
 * The resolved theme from `data-theme` on <html> — the attribute DaisyUI
 * themes key on, which every app hosting MarkdownView already maintains.
 * Read from the DOM instead of an app context so the renderer carries no
 * dependency on how a given app stores or switches its theme.
 */
export const useDocumentTheme = (): DocumentTheme =>
  useSyncExternalStore(subscribe, getSnapshot, () => 'light')
