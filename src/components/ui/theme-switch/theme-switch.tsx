import { useTheme } from 'next-themes'
import { type FC, useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export const ThemeSwitch: FC = () => {
  const { setTheme, theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>('')

  useEffect(() => {
    setCurrentTheme(theme || '')
  }, [theme])

  const changeTheme = useCallback(
    (theme: string) => {
      setTheme(theme)
    },
    [setTheme],
  )

  return (
    <div className="join text-base-content border-base-300 rounded-4xl border-2">
      <button
        className={cn(
          'join-item btn btn-sm rounded-tl-4xl rounded-bl-4xl',
          currentTheme === 'light' ? 'btn-primary btn-soft' : 'btn-ghost',
        )}
        onClick={() => changeTheme('light')}
      >
        <Sun />
      </button>
      <button
        className={cn('join-item btn btn-sm', currentTheme === 'system' ? 'btn-primary btn-soft' : 'btn-ghost')}
        onClick={() => changeTheme('system')}
      >
        <System />
      </button>
      <button
        className={cn(
          'join-item btn btn-sm rounded-tr-4xl rounded-br-4xl',
          currentTheme === 'dark' ? 'btn-primary btn-soft' : 'btn-ghost',
        )}
        onClick={() => changeTheme('dark')}
      >
        <Moon />
      </button>
    </div>
  )
}

const Moon: FC = () => {
  return (
    <svg
      aria-label="moon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="size-5"
    >
      <title>Moon</title>
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </g>
    </svg>
  )
}

const Sun: FC = () => {
  return (
    <svg
      aria-label="sun"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="size-5"
    >
      <title>Sun</title>
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </g>
    </svg>
  )
}

const System: FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="size-5">
      <title>System</title>
      <path d="M40-120v-80h880v80H40Zm120-120q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H160Zm0-80h640v-440H160v440Zm0 0v-440 440Z" />
    </svg>
  )
}
