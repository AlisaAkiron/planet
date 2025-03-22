'use client'

import { isProduction } from '@/lib/env'
import { type FC, useEffect } from 'react'
import { scan } from 'react-scan'

export const ReactScan: FC = () => {
  useEffect(() => {
    scan({
      enabled: !isProduction,
    })
  }, [])

  return <></>
}
