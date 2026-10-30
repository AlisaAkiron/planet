import { useMemo } from 'react'
import rybbit from '@rybbit/js'

type TrackProperties = Parameters<typeof rybbit.event>[1]

export const useRybbit = () =>
  useMemo(
    () => ({
      event: (name: string, properties?: TrackProperties) =>
        rybbit.event(name, properties),
      pageview: (path?: string) => rybbit.pageview(path),
      identify: (userId: string, traits?: Record<string, unknown>) =>
        rybbit.identify(userId, traits),
      clearUserId: () => rybbit.clearUserId(),
    }),
    [],
  )
