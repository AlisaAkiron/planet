import { useColorScheme, useLocalStorage } from '@mantine/hooks'
import { createContext, useContext, useEffect, useMemo } from 'react'

export type Theme = ActiveTheme | 'auto'
export type ActiveTheme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  activeTheme: ActiveTheme
  setTheme: (theme: Theme) => void
}>({
  theme: 'light',
  activeTheme: 'light',
  setTheme: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Both hooks read their real value synchronously on the first client render
  // (getInitialValueInEffect: false). This is hydration-safe because the theme
  // is never rendered into SSR markup — it only feeds an effect and context —
  // and it avoids a one-commit data-theme="light" flash on dark systems.
  const osTheme = useColorScheme('light', {
    getInitialValueInEffect: false,
  })

  const [theme, setThemeSettings] = useLocalStorage<Theme>({
    key: 'planet-theme',
    defaultValue: 'auto',
    getInitialValueInEffect: false,
  })

  const activeTheme: ActiveTheme = useMemo(() => {
    if (theme === 'auto') {
      return osTheme
    }
    return theme
  }, [osTheme, theme])

  const setTheme = (t: Theme) => {
    setThemeSettings(t)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  return (
    <ThemeContext.Provider
      value={{
        theme: theme,
        activeTheme: activeTheme,
        setTheme: setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
