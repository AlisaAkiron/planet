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
  const osTheme = useColorScheme('light', { getInitialValueInEffect: true })

  const [theme, setThemeSettings] = useLocalStorage<Theme>({
    key: 'planet-theme',
    defaultValue: 'auto',
  })

  const activeTheme: ActiveTheme = useMemo(() => {
    if (theme === 'auto') {
      return osTheme
    }
    return theme
  }, [osTheme, theme])

  const setTheme = (theme: Theme) => {
    setThemeSettings(theme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  return (
    <ThemeContext.Provider
      value={{ theme: theme, activeTheme: activeTheme, setTheme: setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
